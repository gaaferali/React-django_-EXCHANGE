import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  User,
  AuthResponse,
  FurnitureItem,
  CreateListingRequest,
  UpdateListingRequest,
  Message,
  ExchangeRequest,
  SearchFilter,
  AdminStats,
  ApiResponse,
  PaginatedResponse,
} from '../types';
import { STORAGE_KEYS } from '../constants/config';

// API Configuration
const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000/api';
const API_TIMEOUT = 30000;

// API Endpoints
const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    GET_PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/update-profile',
  },
  LISTINGS: {
    GET_ALL: '/listings',
    GET_BY_ID: '/listings/:itemID',
    CREATE: '/listings/add',
    UPDATE: '/listings/edit/:itemID',
    DELETE: '/listings/delete/:itemID',
    GET_USER_LISTINGS: '/listings/user/:userID',
    GET_BY_CATEGORY: '/listings/category/:category',
  },
  SEARCH: {
    SEARCH_FURNITURE: '/search/furniture',
    FILTER_BY_PRICE: '/search/filter-price',
    GET_CATEGORIES: '/search/categories',
    GET_CONDITIONS: '/search/conditions',
  },
  MESSAGES: {
    SEND_MESSAGE: '/messages/send',
    GET_CONVERSATION: '/messages/conversation/:userID',
    GET_ALL_CONVERSATIONS: '/messages/conversations',
    GET_MESSAGE_BY_ID: '/messages/:messageID',
    MARK_AS_READ: '/messages/read/:messageID',
  },
  EXCHANGE: {
    CREATE_REQUEST: '/exchange/request',
    GET_REQUESTS: '/exchange/requests/:userID',
    GET_REQUEST_BY_ID: '/exchange/request/:requestID',
    ACCEPT_REQUEST: '/exchange/accept/:requestID',
    REJECT_REQUEST: '/exchange/reject/:requestID',
    COMPLETE_EXCHANGE: '/exchange/complete/:requestID',
  },
  ADMIN: {
    LOGIN: '/admin/login',
    GET_DASHBOARD_STATS: '/admin/stats',
    GET_ALL_USERS: '/admin/users',
    BAN_USER: '/admin/users/ban/:userID',
    UNBAN_USER: '/admin/users/unban/:userID',
    GET_ALL_LISTINGS: '/admin/listings',
    REMOVE_LISTING: '/admin/listings/remove/:itemID',
    GET_REPORTS: '/admin/reports',
    RESOLVE_REPORT: '/admin/reports/resolve/:reportID',
    GET_MESSAGES: '/admin/messages',
  },
};

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
    });

    // Request interceptor to attach JWT token
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor to handle 401 errors
    this.axiosInstance.interceptors.response.use(
      (response: any) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || error.response.statusText;
      return new Error(message);
    } else if (error.request) {
      return new Error('No response from server. Please check your connection.');
    } else {
      return new Error(error.message || 'An error occurred');
    }
  }

  // USER AUTHENTICATION

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        { name, email, password }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<null>>(
        API_ENDPOINTS.AUTH.LOGOUT
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<User>>(
        API_ENDPOINTS.AUTH.GET_PROFILE
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(user: Partial<User>): Promise<User> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<User>>(
        API_ENDPOINTS.AUTH.UPDATE_PROFILE,
        user
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  //FURNITURE LISTINGS 

  async getAllListings(page: number = 1, pageSize: number = 12): Promise<PaginatedResponse<FurnitureItem>> {
    try {
      const response = await this.axiosInstance.get<PaginatedResponse<FurnitureItem>>(
        API_ENDPOINTS.LISTINGS.GET_ALL,
        { params: { page, pageSize } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getListingById(itemID: number): Promise<FurnitureItem> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<FurnitureItem>>(
        API_ENDPOINTS.LISTINGS.GET_BY_ID.replace(':itemID', itemID.toString())
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createListing(data: CreateListingRequest): Promise<FurnitureItem> {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('condition', data.condition);
      formData.append('price', data.price.toString());
      formData.append('imageFile', data.imageFile);

      const response = await this.axiosInstance.post<ApiResponse<FurnitureItem>>(
        API_ENDPOINTS.LISTINGS.CREATE,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateListing(itemID: number, data: UpdateListingRequest): Promise<FurnitureItem> {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('condition', data.condition);
      formData.append('price', data.price.toString());
      if (data.imageFile) {
        formData.append('imageFile', data.imageFile);
      }

      const response = await this.axiosInstance.put<ApiResponse<FurnitureItem>>(
        API_ENDPOINTS.LISTINGS.UPDATE.replace(':itemID', itemID.toString()),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteListing(itemID: number): Promise<ApiResponse<null>> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<null>>(
        API_ENDPOINTS.LISTINGS.DELETE.replace(':itemID', itemID.toString())
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserListings(userID: number, page: number = 1): Promise<PaginatedResponse<FurnitureItem>> {
    try {
      const response = await this.axiosInstance.get<PaginatedResponse<FurnitureItem>>(
        API_ENDPOINTS.LISTINGS.GET_USER_LISTINGS.replace(':userID', userID.toString()),
        { params: { page } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getListingsByCategory(category: string, page: number = 1): Promise<PaginatedResponse<FurnitureItem>> {
    try {
      const response = await this.axiosInstance.get<PaginatedResponse<FurnitureItem>>(
        API_ENDPOINTS.LISTINGS.GET_BY_CATEGORY.replace(':category', category),
        { params: { page } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // SEARCH & FILTER

  async searchFurniture(filters: SearchFilter, page: number = 1): Promise<PaginatedResponse<FurnitureItem>> {
    try {
      const response = await this.axiosInstance.get<PaginatedResponse<FurnitureItem>>(
        API_ENDPOINTS.SEARCH.SEARCH_FURNITURE,
        { params: { ...filters, page } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<string[]>>(
        API_ENDPOINTS.SEARCH.GET_CATEGORIES
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConditions(): Promise<string[]> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<string[]>>(
        API_ENDPOINTS.SEARCH.GET_CONDITIONS
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  //MESSAGING 

  async sendMessage(receiverID: number, content: string): Promise<Message> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<Message>>(
        API_ENDPOINTS.MESSAGES.SEND_MESSAGE,
        { receiverID, content }
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConversation(userID: number, page: number = 1): Promise<PaginatedResponse<Message>> {
    try {
      const response = await this.axiosInstance.get<PaginatedResponse<Message>>(
        API_ENDPOINTS.MESSAGES.GET_CONVERSATION.replace(':userID', userID.toString()),
        { params: { page } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllConversations(page: number = 1): Promise<PaginatedResponse<Message>> {
    try {
      const response = await this.axiosInstance.get<PaginatedResponse<Message>>(
        API_ENDPOINTS.MESSAGES.GET_ALL_CONVERSATIONS,
        { params: { page } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markMessageAsRead(messageID: number): Promise<ApiResponse<null>> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<null>>(
        API_ENDPOINTS.MESSAGES.MARK_AS_READ.replace(':messageID', messageID.toString())
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  //  EXCHANGE REQUESTS

  async createExchangeRequest(offeredItemID: number, requestedItemID: number): Promise<ExchangeRequest> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<ExchangeRequest>>(
        API_ENDPOINTS.EXCHANGE.CREATE_REQUEST,
        { offeredItemID, requestedItemID }
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getExchangeRequests(userID: number): Promise<ExchangeRequest[]> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<ExchangeRequest[]>>(
        API_ENDPOINTS.EXCHANGE.GET_REQUESTS.replace(':userID', userID.toString())
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async acceptExchangeRequest(requestID: number): Promise<ExchangeRequest> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<ExchangeRequest>>(
        API_ENDPOINTS.EXCHANGE.ACCEPT_REQUEST.replace(':requestID', requestID.toString())
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rejectExchangeRequest(requestID: number): Promise<ExchangeRequest> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<ExchangeRequest>>(
        API_ENDPOINTS.EXCHANGE.REJECT_REQUEST.replace(':requestID', requestID.toString())
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ADMIN FUNCTIONS

  async adminLogin(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.ADMIN.LOGIN,
        { email, password }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAdminStats(): Promise<AdminStats> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<AdminStats>>(
        API_ENDPOINTS.ADMIN.GET_DASHBOARD_STATS
      );
      return response.data.data!;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllUsers(page: number = 1): Promise<PaginatedResponse<User>> {
    try {
      const response = await this.axiosInstance.get<PaginatedResponse<User>>(
        API_ENDPOINTS.ADMIN.GET_ALL_USERS,
        { params: { page } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async banUser(userID: number, reason: string): Promise<ApiResponse<null>> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<null>>(
        API_ENDPOINTS.ADMIN.BAN_USER.replace(':userID', userID.toString()),
        { reason }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async unbanUser(userID: number): Promise<ApiResponse<null>> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<null>>(
        API_ENDPOINTS.ADMIN.UNBAN_USER.replace(':userID', userID.toString())
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllListingsAdmin(page: number = 1): Promise<PaginatedResponse<FurnitureItem>> {
    try {
      const response = await this.axiosInstance.get<PaginatedResponse<FurnitureItem>>(
        API_ENDPOINTS.ADMIN.GET_ALL_LISTINGS,
        { params: { page } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeListingAdmin(itemID: number, reason: string): Promise<ApiResponse<null>> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<null>>(
        API_ENDPOINTS.ADMIN.REMOVE_LISTING.replace(':itemID', itemID.toString()),
        { data: { reason } }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default new ApiService();
