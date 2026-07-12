import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getCart } from '../services/cart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [count, setCount] = useState(0);
  const refreshCartCount = useCallback(async () => {
    try {
      const items = await getCart();
      const next = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      setCount(next);
      return next;
    } catch { return 0; }
  }, []);
  const value = useMemo(() => ({ count, setCount, refreshCartCount }), [count, refreshCartCount]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartCount() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCartCount must be used inside CartProvider');
  return value;
}
