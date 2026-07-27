// User related types
export interface User {
  userID: number;
  email: string;
  name: string;
  profileImage?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

// Furniture Listing types
export interface FurnitureItem {
  itemID: number;
  userID: number;
  title: string;
  description: string;
  category: string;
  condition: 'Used' | 'Like New' | 'Excellent';
  price: number;
  imagePath: string;
  imageFile?: File;
  status: 'available' | 'sold' | 'exchanged';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  imageFile: File;
}

export interface UpdateListingRequest {
  itemID: number;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  imageFile?: File;
}

// Messaging types
export interface Message {
  messageID: number;
  senderID: number;
  receiverID: number;
  content: string;
  timestamp: string;
  senderName?: string;
  isRead?: boolean;
}

export interface SendMessageRequest {
  receiverID: number;
  content: string;
}

// Exchange Request types
export interface ExchangeRequest {
  requestID: number;
  offeredItemID: number;
  requestedItemID: number;
  senderID: number;
  receiverID: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExchangeRequest {
  offeredItemID: number;
  requestedItemID: number;
}

// Search & Filter types
export interface SearchFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  searchTerm?: string;
}

// Admin types
export interface AdminUser {
  adminID: number;
  email: string;
  role: 'admin' | 'moderator';
  createdAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  totalMessages: number;
  reportedContent: number;
  bannedUsers: number;
}

export interface ReportedContent {
  reportID: number;
  contentType: 'listing' | 'user' | 'message';
  contentID: number;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

// Auth Context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
