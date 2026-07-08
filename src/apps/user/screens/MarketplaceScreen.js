import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';
import { getProducts, getProductTypes } from '../services/products';
import { getCategories } from '../services/categories';

const EMPTY_FILTERS = {
  minPrice: '',
  maxPrice: '',
  stock: '',
  sort: '',
  attributes: {},
};

const STOCK_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'In stock', value: 'in' },
  { label: 'Out of stock', value: 'out' },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: '' },
  { label: 'Price: Low to High', value: 'low_to_high' },
  { label: 'Price: High to Low', value: 'high_to_low' },
];

function collectAttributeOptions(products) {
  const groups = {};

  products.forEach((product) => {
    product.variants.forEach((variant) => {
      variant.attributes.forEach((attribute) => {
        const name = String(attribute.name || '').trim();
        const value = String(attribute.value || '').trim();
        if (!name || !value) return;
        if (!groups[name]) groups[name] = new Set();
        groups[name].add(value);
      });
    });
  });

  return Object.entries(groups).map(([name, values]) => ({
    name,
    values: [...values],
  }));
}

function matchesAttributes(product, selectedAttributes) {
  const selections = Object.entries(selectedAttributes).filter(([, value]) => value);
  if (!selections.length) return true;

  return product.variants.some((variant) =>
    selections.every(([selectedName, selectedValue]) =>
      variant.attributes.some(
        (attribute) =>
          String(attribute.name).toLowerCase() === selectedName.toLowerCase() &&
          String(attribute.value).toLowerCase() === selectedValue.toLowerCase(),
      ),
    ),
  );
}

export default function MarketplaceScreen({ navigation, route }) {
  const isTabScreen = route.name === 'Grocery';
  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;
  const initialSearch = route.params?.search || '';
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [attributeOptions, setAttributeOptions] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [submittedSearch, setSubmittedSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedTypeId(null);
  }, [categoryId]);

  useEffect(() => {
    const nextSearch = route.params?.search || '';
    setSearch(nextSearch);
    setSubmittedSearch(nextSearch);
  }, [route.params?.search]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getProducts({
        page: 1,
        limit: 20,
        categoryId,
        typeId: selectedTypeId || undefined,
        search: submittedSearch.trim() || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        stock: filters.stock || undefined,
        sort: filters.sort || undefined,
      });
      setAttributeOptions(collectAttributeOptions(response.products));
      setProducts(
        response.products.filter((product) =>
          matchesAttributes(product, filters.attributes),
        ),
      );
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load products');
    } finally {
      setLoading(false);
    }
  }, [categoryId, filters, selectedTypeId, submittedSearch]);

  const loadTypes = useCallback(async () => {
    try {
      setProductTypes(await getProductTypes(categoryId));
    } catch {
      setProductTypes([]);
    }
  }, [categoryId]);

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await getCategories());
    } catch {
      setCategories([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
      loadTypes();
      loadCategories();
    }, [loadCategories, loadProducts, loadTypes]),
  );

  const openFilters = () => {
    setDraftFilters({
      ...filters,
      attributes: { ...filters.attributes },
    });
    setFilterVisible(true);
  };

  const submitSearch = () => {
    setSubmittedSearch(search.trim());
  };

  const selectCategory = (category) => {
    setSelectedTypeId(null);
    navigation.setParams({
      categoryId: category?.id,
      categoryName: category?.name,
    });
  };

  const applyFilters = () => {
    setFilters({
      ...draftFilters,
      attributes: { ...draftFilters.attributes },
    });
    setFilterVisible(false);
  };

  const clearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setFilterVisible(false);
  };

  const activeFilterCount =
    Number(Boolean(filters.minPrice || filters.maxPrice)) +
    Number(Boolean(filters.stock)) +
    Number(Boolean(filters.sort)) +
    Object.values(filters.attributes).filter(Boolean).length;

  const openProduct = (product) =>
    navigation.navigate('ProductDetail', { productId: product.id, product });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        {isTabScreen ? <View style={styles.backPlaceholder} /> : (
          <BackButton onPress={() => navigation.goBack()} />
        )}
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>{categoryName || 'All Products'}</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Loading...' : `${products.length} products`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
        >
          <Feather name="shopping-cart" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={submitSearch}
          returnKeyType="search"
          placeholder="Search products..."
          placeholderTextColor={Colors.textMuted}
        />
        {search ? (
          <TouchableOpacity onPress={() => { setSearch(''); setSubmittedSearch(''); }}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeList}
        >
          <TouchableOpacity
            style={[styles.typeChip, !categoryId && styles.typeChipActive]}
            onPress={() => selectCategory(null)}
          >
            <Text style={[styles.typeChipText, !categoryId && styles.typeChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.typeChip,
                categoryId === category.id && styles.typeChipActive,
              ]}
              onPress={() => selectCategory(category)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  categoryId === category.id && styles.typeChipTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.filterButton} onPress={openFilters}>
          <Text style={styles.filterButtonText}>
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {productTypes.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subtypeList}
        >
          <TouchableOpacity
            style={[styles.subtypeChip, !selectedTypeId && styles.subtypeChipActive]}
            onPress={() => setSelectedTypeId(null)}
          >
            <Text style={[styles.subtypeChipText, !selectedTypeId && styles.subtypeChipTextActive]}>
              All in {categoryName || 'category'}
            </Text>
          </TouchableOpacity>
          {productTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.subtypeChip,
                selectedTypeId === type.id && styles.subtypeChipActive,
              ]}
              onPress={() => setSelectedTypeId(type.id)}
            >
              <Text
                style={[
                  styles.subtypeChipText,
                  selectedTypeId === type.id && styles.subtypeChipTextActive,
                ]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateText}>Loading products...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Could not load products</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <View style={styles.stateBox}>
              <Text style={styles.stateTitle}>No products found</Text>
              <Text style={styles.stateText}>
                Add products from admin or try another category.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              activeOpacity={0.86}
              onPress={() => openProduct(item)}
            >
              <View style={styles.imageBox}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.productImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.imageFallback}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                )}
                {item.stock <= 5 && (
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockBadgeText}>
                      {item.stock ? `Only ${item.stock}` : 'Out'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.categoryText} numberOfLines={1}>
                {item.category}
              </Text>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              {item.variants[0] && (
                <Text style={styles.variantText} numberOfLines={1}>
                  {item.variants[0].label}
                  {item.variants.length > 1
                    ? ` +${item.variants.length - 1} more`
                    : ''}
                </Text>
              )}
              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.price}>Rs {item.price.toLocaleString()}</Text>
                  {item.mrp > item.price && (
                    <Text style={styles.mrp}>Rs {item.mrp.toLocaleString()}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => openProduct(item)}
                >
                  <Text style={styles.addButtonText}>ADD</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismiss}
            activeOpacity={1}
            onPress={() => setFilterVisible(false)}
          />
          <View style={styles.filterSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter products</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearFilters}>Clear all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterLabel}>Price range</Text>
              <View style={styles.priceInputs}>
                <TextInput
                  style={styles.priceInput}
                  value={draftFilters.minPrice}
                  onChangeText={(value) =>
                    setDraftFilters((current) => ({ ...current, minPrice: value }))
                  }
                  keyboardType="numeric"
                  placeholder="Min price"
                  placeholderTextColor={Colors.textMuted}
                />
                <Text style={styles.priceSeparator}>to</Text>
                <TextInput
                  style={styles.priceInput}
                  value={draftFilters.maxPrice}
                  onChangeText={(value) =>
                    setDraftFilters((current) => ({ ...current, maxPrice: value }))
                  }
                  keyboardType="numeric"
                  placeholder="Max price"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <Text style={styles.filterLabel}>Availability</Text>
              <View style={styles.optionWrap}>
                {STOCK_OPTIONS.map((option) => (
                  <FilterOption
                    key={option.label}
                    label={option.label}
                    selected={draftFilters.stock === option.value}
                    onPress={() =>
                      setDraftFilters((current) => ({
                        ...current,
                        stock: option.value,
                      }))
                    }
                  />
                ))}
              </View>

              <Text style={styles.filterLabel}>Sort by</Text>
              <View style={styles.optionWrap}>
                {SORT_OPTIONS.map((option) => (
                  <FilterOption
                    key={option.label}
                    label={option.label}
                    selected={draftFilters.sort === option.value}
                    onPress={() =>
                      setDraftFilters((current) => ({
                        ...current,
                        sort: option.value,
                      }))
                    }
                  />
                ))}
              </View>

              {attributeOptions.map((group) => (
                <View key={group.name}>
                  <Text style={styles.filterLabel}>{group.name}</Text>
                  <View style={styles.optionWrap}>
                    {group.values.map((value) => (
                      <FilterOption
                        key={value}
                        label={value}
                        selected={draftFilters.attributes[group.name] === value}
                        onPress={() =>
                          setDraftFilters((current) => ({
                            ...current,
                            attributes: {
                              ...current.attributes,
                              [group.name]:
                                current.attributes[group.name] === value ? '' : value,
                            },
                          }))
                        }
                      />
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Show products</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FilterOption({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.optionChip, selected && styles.optionChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.optionText, selected && styles.optionTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backPlaceholder: { width: 40 },
  headerCopy: { flex: 1 },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '800' },
  headerSubtitle: { color: Colors.textSecondary, fontSize: FontSize.xs },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#F3B9BE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    margin: Spacing.lg,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, paddingVertical: 12, color: Colors.textPrimary },
  clearText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '800' },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 8,
  },
  typeList: { gap: 8, paddingRight: 4 },
  typeChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  typeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  typeChipText: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: '700' },
  typeChipTextActive: { color: Colors.white },
  subtypeList: {
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  subtypeChip: {
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  subtypeChipActive: { backgroundColor: Colors.secondaryLight },
  subtypeChipText: { color: Colors.secondary, fontSize: FontSize.xs, fontWeight: '800' },
  subtypeChipTextActive: { color: Colors.secondaryDark },
  filterButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  filterButtonText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '900' },
  list: { padding: Spacing.md, paddingBottom: 100, flexGrow: 1 },
  row: { gap: 10 },
  productCard: {
    flex: 1,
    marginBottom: 10,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    padding: 10,
    ...Shadow.sm,
  },
  imageBox: {
    height: 130,
    borderRadius: Radius.md,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: { width: '100%', height: '100%' },
  imageFallback: { color: Colors.secondary, fontSize: 48, fontWeight: '900' },
  stockBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.warning,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  stockBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '900' },
  categoryText: {
    marginTop: 9,
    color: Colors.secondary,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  productName: {
    minHeight: 38,
    marginTop: 3,
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  variantText: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 3 },
  priceRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '900' },
  mrp: {
    color: Colors.textMuted,
    fontSize: 10,
    textDecorationLine: 'line-through',
  },
  addButton: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  addButtonText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '900' },
  stateBox: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  stateTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' },
  stateText: {
    marginTop: 7,
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: { color: Colors.white, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalDismiss: { flex: 1 },
  filterSheet: {
    maxHeight: '82%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 24,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray300,
    marginTop: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' },
  clearFilters: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '800' },
  filterLabel: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '900',
  },
  priceInputs: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    color: Colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  priceSeparator: { color: Colors.textMuted, fontSize: FontSize.sm },
  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  optionChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionText: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: '700' },
  optionTextActive: { color: Colors.primary, fontWeight: '900' },
  applyButton: {
    marginTop: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '900' },
});
