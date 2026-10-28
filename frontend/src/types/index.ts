export interface PublicUser {
  id: number;
  name: string;
  profile_image_url: string | null;
  location: string;
}

export interface User extends PublicUser {
  email: string;
  bio: string;
  is_staff: boolean;
  is_banned: boolean;
  is_active?: boolean;
  created_at: string;
  last_login?: string | null;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export type ListingStatus = 'available' | 'reserved' | 'sold' | 'exchanged' | 'inactive';
export type ListingType = 'sale' | 'exchange' | 'both';

export interface ListingImage {
  id: number;
  url: string;
  position: number;
}

export interface FurnitureItem {
  id: number;
  owner: PublicUser;
  title: string;
  description: string;
  price: string;
  cover_image_url: string | null;
  images: ListingImage[];
  status: ListingStatus;
  condition: string;
  condition_display: string;
  category: string;
  category_display: string;
  listing_type: ListingType;
  listing_type_display: string;
  location: string;
  is_featured: boolean;
  is_favorited: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingInput {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  listing_type: ListingType;
  location: string;
  cover_image?: File;
  uploaded_images?: File[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Choice {
  value: string;
  label: string;
}

export interface ListingMetadata {
  categories: Choice[];
  conditions: Choice[];
  listing_types: Choice[];
}

export type RequestType = 'purchase' | 'exchange';
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface TransactionRequest {
  id: number;
  requester: PublicUser;
  recipient: PublicUser;
  listing: FurnitureItem;
  offered_item: FurnitureItem | null;
  request_type: RequestType;
  offered_amount: string | null;
  message: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface Message {
  id: number;
  sender: PublicUser;
  body: string;
  created_at: string;
  read_at: string | null;
}

export interface Conversation {
  id: number;
  participant_one: PublicUser;
  participant_two: PublicUser;
  other_participant: PublicUser;
  listing: FurnitureItem | null;
  transaction_request_id: number | null;
  last_message: Message | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  users: number;
  active_listings: number;
  pending_requests: number;
  messages: number;
  suspended_users: number;
}

export interface ApiValidationError {
  detail?: string;
  errors?: Record<string, string[] | string>;
}
