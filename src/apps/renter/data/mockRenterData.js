export const renterStats = [
  { label: 'Active spaces', value: '12', tone: 'blue' },
  { label: 'Open leads', value: '28', tone: 'red' },
  { label: 'This month', value: '1.8L', tone: 'green' },
  { label: 'Pending checks', value: '4', tone: 'orange' },
];

export const spaces = [
  {
    id: 'space-1',
    title: '2BHK Apartment',
    location: 'Sector 12, Model Town',
    mode: 'Rent',
    category: 'Residential',
    price: '12000',
    priceLabel: 'Rs 12,000/mo',
    size: '850 sq ft',
    floor: '3rd floor',
    status: 'Live',
    leads: 9,
    views: 248,
    verification: 'Verified',
    amenities: ['Parking', 'WiFi', 'Furnished'],
  },
  {
    id: 'space-2',
    title: 'Shop Front',
    location: 'Main Market Road',
    mode: 'Rent',
    category: 'Commercial',
    price: '25000',
    priceLabel: 'Rs 25,000/mo',
    size: '420 sq ft',
    floor: 'Ground',
    status: 'Review',
    leads: 5,
    views: 131,
    verification: 'Docs pending',
    amenities: ['Shutter', 'Power', 'Road facing'],
  },
  {
    id: 'space-3',
    title: 'Plot For Sale',
    location: 'Green Park Extension',
    mode: 'Sell',
    category: 'Land',
    price: '1850000',
    priceLabel: 'Rs 18.5L',
    size: '1200 sq ft',
    floor: 'Open plot',
    status: 'Draft',
    leads: 2,
    views: 74,
    verification: 'Not submitted',
    amenities: ['Registry ready', 'Boundary', 'Corner'],
  },
];

export const leads = [
  {
    id: 'lead-1',
    name: 'Aman Sharma',
    space: '2BHK Apartment',
    budget: 'Rs 12,000/mo',
    status: 'Visit booked',
    time: 'Today, 5:30 PM',
  },
  {
    id: 'lead-2',
    name: 'Priya Mehta',
    space: 'Shop Front',
    budget: 'Rs 24,000/mo',
    status: 'Negotiating',
    time: 'Tomorrow, 11:00 AM',
  },
  {
    id: 'lead-3',
    name: 'Karan Gill',
    space: 'Plot For Sale',
    budget: 'Rs 18L',
    status: 'Needs callback',
    time: 'Sat, 1:00 PM',
  },
];

export const listingCategories = ['Residential', 'Commercial', 'Hostel', 'Land', 'Warehouse'];
export const listingModes = ['Rent', 'Sell'];
export const furnishedOptions = ['Unfurnished', 'Semi furnished', 'Fully furnished'];
