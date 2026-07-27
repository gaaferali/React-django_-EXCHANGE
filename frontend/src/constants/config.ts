// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'furniture_exchange_token',
  USER_DATA: 'furniture_exchange_user',
  ADMIN_TOKEN: 'furniture_exchange_admin_token',
  THEME: 'furniture_exchange_theme',
};

// Messages and Error Messages
export const MESSAGES = {
  // Success 
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful! Please log in.',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  LISTING_CREATED: 'Listing created successfully!',
  LISTING_UPDATED: 'Listing updated successfully!',
  LISTING_DELETED: 'Listing deleted successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
  EXCHANGE_REQUEST_CREATED: 'Exchange request created!',
  EXCHANGE_REQUEST_ACCEPTED: 'Exchange request accepted!',
  EXCHANGE_REQUEST_REJECTED: 'Exchange request rejected!',
  PROFILE_UPDATED: 'Profile updated successfully!',

  // Error 
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  REGISTER_FAILED: 'Registration failed. Please try again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  REQUIRED_FIELD: 'This field is required.',
  FILE_UPLOAD_ERROR: 'Error uploading file. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',

  // Validation 
  TITLE_REQUIRED: 'Title is required.',
  DESCRIPTION_REQUIRED: 'Description is required.',
  CATEGORY_REQUIRED: 'Category is required.',
  PRICE_REQUIRED: 'Price is required.',
  PRICE_INVALID: 'Price must be a positive number.',
  CONDITION_REQUIRED: 'Condition is required.',
  IMAGE_REQUIRED: 'Please upload an image.',
  IMAGE_SIZE_LIMIT: 'Image size must not exceed 5MB.',
};

// UI Constants
export const UI_CONSTANTS = {
  // Navbar
  NAVBAR_BRAND: 'Furniture Exchange',
  
  // Page titles
  PAGE_TITLES: {
    HOME: 'Browse Listings',
    LOGIN: 'Login',
    REGISTER: 'Register',
    DASHBOARD: 'User Dashboard',
    PROFILE: 'My Profile',
    CREATE_LISTING: 'Create Listing',
    EDIT_LISTING: 'Edit Listing',
    LISTING_DETAIL: 'Listing Detail',
    MESSAGES: 'Messages',
    EXCHANGE_REQUESTS: 'Exchange Requests',
    ADMIN_PANEL: 'Admin Panel',
    ADMIN_USERS: 'Manage Users',
    ADMIN_LISTINGS: 'Manage Listings',
    ADMIN_REPORTS: 'Reports',
  },

  // Buttons
  BUTTONS: {
    LOGIN: 'Login',
    REGISTER: 'Register',
    LOGOUT: 'Logout',
    SUBMIT: 'Submit',
    CANCEL: 'Cancel',
    SAVE: 'Save',
    DELETE: 'Delete',
    EDIT: 'Edit',
    SEND: 'Send',
    MESSAGE: 'Message Seller',
    ACCEPT: 'Accept',
    REJECT: 'Reject',
    BROWSE: 'Browse Listings',
    CREATE_LISTING: 'Create Listing',
    MY_LISTINGS: 'My Listings',
    MY_MESSAGES: 'Messages',
    MY_PROFILE: 'My Profile',
  },
};

// Animation and Theme settings
export const THEME = {
  COLORS: {
    PRIMARY: '#007bff',
    SECONDARY: '#6c757d',
    SUCCESS: '#28a745',
    DANGER: '#dc3545',
    WARNING: '#ffc107',
    INFO: '#17a2b8',
    LIGHT: '#f8f9fa',
    DARK: '#343a40',
  },
  BREAKPOINTS: {
    XS: 0,
    SM: 576,
    MD: 768,
    LG: 992,
    XL: 1200,
  },
};

// JWT Token
export const JWT_CONFIG = {
  HEADER_NAME: 'Authorization',
  BEARER_PREFIX: 'Bearer',
  EXPIRE_TIME: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Validation Rules
export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PRICE_MAX_VALUE: 999999,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000,
};
