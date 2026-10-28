import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  AdminStats,
  ApiValidationError,
  AuthResponse,
  Conversation,
  FurnitureItem,
  ListingInput,
  ListingMetadata,
  Message,
  PaginatedResponse,
  TransactionRequest,
  User,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';
const ACCESS_KEY = 'furnish_access';
const REFRESH_KEY = 'furnish_refresh';

export const tokenStore = {
  access: () => sessionStorage.getItem(ACCESS_KEY),
  refresh: () => sessionStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh?: string) => {
    sessionStorage.setItem(ACCESS_KEY, access);
    if (refresh) sessionStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  },
};

const client = axios.create({ baseURL: API_BASE_URL, timeout: 20_000 });
let refreshPromise: Promise<string> | null = null;

client.interceptors.request.use((config) => {
  const access = tokenStore.access();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const refresh = tokenStore.refresh();
    if (error.response?.status === 401 && original && !original._retried && refresh) {
      original._retried = true;
      refreshPromise ??= axios
        .post<{ access: string; refresh?: string }>(`${API_BASE_URL}/auth/token/refresh/`, { refresh })
        .then(({ data }) => {
          tokenStore.set(data.access, data.refresh);
          return data.access;
        })
        .finally(() => {
          refreshPromise = null;
        });
      try {
        const access = await refreshPromise;
        original.headers.Authorization = `Bearer ${access}`;
        return client(original);
      } catch {
        tokenStore.clear();
        window.dispatchEvent(new Event('auth:expired'));
      }
    }
    return Promise.reject(error);
  },
);

export function apiError(error: unknown): string {
  if (axios.isAxiosError<ApiValidationError>(error)) {
    const payload = error.response?.data;
    if (payload?.errors) {
      const first = Object.values(payload.errors)[0];
      if (Array.isArray(first)) return first[0] ?? payload.detail ?? 'Request failed.';
      if (typeof first === 'string') return first;
    }
    return payload?.detail ?? error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong.';
}

function listingFormData(input: ListingInput): FormData {
  const data = new FormData();
  data.append('title', input.title);
  data.append('description', input.description);
  data.append('price', input.price || '0');
  data.append('category', input.category);
  data.append('condition', input.condition);
  data.append('listing_type', input.listing_type);
  data.append('location', input.location);
  if (input.cover_image) data.append('cover_image', input.cover_image);
  input.uploaded_images?.forEach((image) => data.append('uploaded_images', image));
  return data;
}

const api = {
  async register(payload: { name: string; email: string; password: string; password_confirm: string }) {
    return (await client.post<AuthResponse>('/auth/register/', payload)).data;
  },
  async login(email: string, password: string) {
    return (await client.post<AuthResponse>('/auth/login/', { email, password })).data;
  },
  async logout() {
    const refresh = tokenStore.refresh();
    if (refresh) await client.post('/auth/logout/', { refresh });
  },
  async profile() {
    return (await client.get<User>('/auth/profile/')).data;
  },
  async updateProfile(payload: { name: string; bio: string; location: string; profile_image?: File }) {
    const data = new FormData();
    Object.entries(payload).forEach(([key, value]) => value && data.append(key, value));
    return (await client.patch<User>('/auth/profile/', data)).data;
  },
  async listings(params: Record<string, string | number | undefined> = {}) {
    return (await client.get<PaginatedResponse<FurnitureItem>>('/listings/', { params })).data;
  },
  async listing(id: number) {
    return (await client.get<FurnitureItem>(`/listings/${id}/`)).data;
  },
  async metadata() {
    return (await client.get<ListingMetadata>('/listings/metadata/')).data;
  },
  async myListings(params: Record<string, string | number | undefined> = {}) {
    return (await client.get<PaginatedResponse<FurnitureItem>>('/listings/mine/', { params })).data;
  },
  async createListing(input: ListingInput) {
    return (await client.post<FurnitureItem>('/listings/', listingFormData(input))).data;
  },
  async updateListing(id: number, input: ListingInput) {
    return (await client.patch<FurnitureItem>(`/listings/${id}/`, listingFormData(input))).data;
  },
  async deleteListing(id: number) {
    await client.delete(`/listings/${id}/`);
  },
  async favorites(params: Record<string, string | number | undefined> = {}) {
    return (await client.get<PaginatedResponse<FurnitureItem>>('/listings/favorites/', { params })).data;
  },
  async setFavorite(id: number, active: boolean) {
    if (active) await client.post(`/listings/${id}/favorite/`);
    else await client.delete(`/listings/${id}/favorite/`);
  },
  async requests(params: Record<string, string | number | undefined> = {}) {
    return (await client.get<PaginatedResponse<TransactionRequest>>('/requests/', { params })).data;
  },
  async createRequest(payload: { listing_id: number; request_type: 'purchase' | 'exchange'; offered_item_id?: number; message?: string }) {
    return (await client.post<TransactionRequest>('/requests/', payload)).data;
  },
  async transitionRequest(id: number, action: 'accept' | 'reject' | 'cancel') {
    return (await client.post<TransactionRequest>(`/requests/${id}/${action}/`)).data;
  },
  async conversations() {
    return (await client.get<PaginatedResponse<Conversation>>('/conversations/')).data;
  },
  async createConversation(payload: { recipient_id: number; listing_id?: number; request_id?: number }) {
    return (await client.post<Conversation>('/conversations/', payload)).data;
  },
  async messages(conversationId: number) {
    return (await client.get<PaginatedResponse<Message>>(`/conversations/${conversationId}/messages/`)).data;
  },
  async sendMessage(conversationId: number, body: string) {
    return (await client.post<Message>(`/conversations/${conversationId}/messages/`, { body })).data;
  },
  async markConversationRead(conversationId: number) {
    await client.post(`/conversations/${conversationId}/read/`);
  },
  async adminStats() {
    return (await client.get<AdminStats>('/admin/stats/')).data;
  },
  async adminUsers(params: Record<string, string | number | undefined> = {}) {
    return (await client.get<PaginatedResponse<User>>('/admin/users/', { params })).data;
  },
  async setUserBanned(id: number, banned: boolean) {
    return (await client.post<User>(`/admin/users/${id}/${banned ? 'ban' : 'unban'}/`)).data;
  },
  async adminListings(params: Record<string, string | number | undefined> = {}) {
    return (await client.get<PaginatedResponse<FurnitureItem>>('/admin/listings/', { params })).data;
  },
  async moderateListing(id: number) {
    return (await client.post<FurnitureItem>(`/admin/listings/${id}/moderate/`)).data;
  },
};

export function websocketUrl(conversationId: number): string {
  const configured = import.meta.env.VITE_WS_URL as string | undefined;
  const root = configured ?? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;
  return `${root.replace(/\/$/, '')}/ws/conversations/${conversationId}/?token=${encodeURIComponent(tokenStore.access() ?? '')}`;
}

export default api;
