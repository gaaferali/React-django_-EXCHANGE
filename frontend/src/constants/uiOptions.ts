// UI Dropdown Options and Image Placeholders
export const UI_OPTIONS = {
  // Image placeholders
  DEFAULT_FURNITURE_IMAGE: 'https://via.placeholder.com/300x300?text=Furniture+Item',
  DEFAULT_USER_AVATAR: 'https://via.placeholder.com/150x150?text=User+Avatar',
  DEFAULT_ADMIN_AVATAR: 'https://via.placeholder.com/150x150?text=Admin',

  // Dropdown options
  CATEGORIES: [
    'Sofa',
    'Chair',
    'Bed',
    'Table',
    'Cabinet',
    'Desk',
    'Shelf',
    'Wardrobe',
    'Other',
  ],

  CONDITIONS: [
    { value: 'Used', label: 'Used' },
    { value: 'Like New', label: 'Like New' },
    { value: 'Excellent', label: 'Excellent' },
  ],

  FURNITURE_STATUS: [
    { value: 'available', label: 'Available' },
    { value: 'sold', label: 'Sold' },
    { value: 'exchanged', label: 'Exchanged' },
  ],

  EXCHANGE_STATUS: [
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
  ],

  // Price ranges for filtering
  PRICE_RANGES: [
    { min: 0, max: 100, label: 'Under $100' },
    { min: 100, max: 500, label: '$100 - $500' },
    { min: 500, max: 1000, label: '$500 - $1000' },
    { min: 1000, max: 5000, label: 'Over $1000' },
  ],
};

// Convenience exports for backward compatibility
export const PLACEHOLDERS = {
  DEFAULT_FURNITURE_IMAGE: UI_OPTIONS.DEFAULT_FURNITURE_IMAGE,
  DEFAULT_USER_AVATAR: UI_OPTIONS.DEFAULT_USER_AVATAR,
  DEFAULT_ADMIN_AVATAR: UI_OPTIONS.DEFAULT_ADMIN_AVATAR,
  CATEGORIES: UI_OPTIONS.CATEGORIES,
  CONDITIONS: UI_OPTIONS.CONDITIONS,
  FURNITURE_STATUS: UI_OPTIONS.FURNITURE_STATUS,
  EXCHANGE_STATUS: UI_OPTIONS.EXCHANGE_STATUS,
  PRICE_RANGES: UI_OPTIONS.PRICE_RANGES,
};
