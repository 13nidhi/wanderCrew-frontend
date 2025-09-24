// API related type definitions
// Following React/TypeScript best practices

import type { ApiResponse, PaginatedResponse } from './index';

// Generic API error type
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Date;
}

// Request/Response types for different endpoints
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface LoginResponse {
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly name: string;
    readonly profilePicture?: string;
  };
  readonly token: string;
  readonly refreshToken: string;
}

export interface SignupRequest {
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly profilePicture?: string;
}

export interface SignupResponse {
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly name: string;
  };
  readonly token: string;
  readonly refreshToken: string;
}

export interface CreateTripRequest {
  readonly title: string;
  readonly destination: string;
  readonly description: string;
  readonly startDate: string; // ISO string
  readonly endDate: string; // ISO string
  readonly budget: {
    readonly min: number;
    readonly max: number;
    readonly currency: string;
  };
  readonly maxGroupSize: number;
  readonly tags: string[];
  readonly requirements: string[];
}

export interface UpdateTripRequest extends Partial<CreateTripRequest> {
  readonly status?: string;
}

export interface JoinTripRequest {
  readonly tripId: string;
  readonly message: string;
}

export interface GenerateItineraryRequest {
  readonly tripId: string;
  readonly preferences: {
    readonly interests: string[];
    readonly travelStyle: string;
    readonly accommodationType: string;
  };
}

// API response types for specific endpoints
export type LoginApiResponse = ApiResponse<LoginResponse>;
export type SignupApiResponse = ApiResponse<SignupResponse>;
export type TripsApiResponse = PaginatedResponse;
export type TripApiResponse = ApiResponse;
export type JoinRequestApiResponse = ApiResponse<{ readonly requestId: string }>;
export type ItineraryApiResponse = ApiResponse;

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request configuration type
export interface RequestConfig {
  readonly method: HttpMethod;
  readonly headers?: Record<string, string>;
  readonly body?: string | FormData;
  readonly signal?: AbortSignal;
}

// API client configuration
export interface ApiClientConfig {
  readonly baseURL: string;
  readonly timeout: number;
  readonly defaultHeaders: Record<string, string>;
  readonly retryAttempts: number;
  readonly retryDelay: number;
}

// Query parameters type for GET requests
export interface QueryParams {
  readonly [key: string]: string | number | boolean | undefined;
}

// Pagination parameters
export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

// Search parameters
export interface SearchParams extends PaginationParams {
  readonly query?: string;
  readonly filters?: Record<string, unknown>;
}

// File upload types
export interface FileUploadRequest {
  readonly file: File;
  readonly folder?: string;
  readonly maxSize?: number;
  readonly allowedTypes?: string[];
}

export interface FileUploadResponse {
  readonly url: string;
  readonly filename: string;
  readonly size: number;
  readonly mimeType: string;
}

export type FileUploadApiResponse = ApiResponse<FileUploadResponse>;

// WebSocket message types
export interface WebSocketMessage<T = unknown> {
  readonly type: string;
  readonly payload: T;
  readonly timestamp: Date;
  readonly id: string;
}

export interface ChatMessagePayload {
  readonly tripId: string;
  readonly senderId: string;
  readonly content: string;
  readonly type: string;
}

export interface TypingIndicatorPayload {
  readonly tripId: string;
  readonly userId: string;
  readonly userName: string;
  readonly isTyping: boolean;
}

// Notification types
export interface NotificationPayload {
  readonly type: 'message' | 'join_request' | 'trip_update' | 'rating_reminder';
  readonly title: string;
  readonly body: string;
  readonly data?: Record<string, unknown>;
  readonly tripId?: string;
  readonly userId?: string;
}

// Cache configuration types
export interface CacheConfig {
  readonly enabled: boolean;
  readonly ttl: number; // Time to live in milliseconds
  readonly maxSize: number;
  readonly strategy: 'memory' | 'localStorage' | 'sessionStorage';
}

// API hook return types
export interface UseApiState<T = unknown> {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly refetch: () => Promise<void>;
}

export interface UseMutationState<T = unknown, V = unknown> {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly mutate: (variables: V) => Promise<T>;
  readonly reset: () => void;
}
