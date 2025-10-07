// Component-specific type definitions
// Following React/TypeScript best practices

import type { ReactNode } from 'react';
import type { ChatMessage, Trip, User } from './index';

// Base component props
export interface BaseComponentProps {
  readonly className?: string;
  readonly children?: ReactNode;
  readonly 'data-testid'?: string;
  readonly id?: string;
  readonly role?: string;
  readonly 'aria-label'?: string;
  readonly 'aria-labelledby'?: string;
  readonly 'aria-describedby'?: string;
}

// Button component props
export interface ButtonProps extends BaseComponentProps {
  readonly variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly type?: 'button' | 'submit' | 'reset';
  readonly onClick?: () => void;
  readonly fullWidth?: boolean;
  readonly icon?: ReactNode;
  readonly iconPosition?: 'left' | 'right';
}

// Input component props
export interface InputProps extends BaseComponentProps {
  readonly type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  readonly value?: string;
  readonly defaultValue?: string;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly error?: string;
  readonly label?: string;
  readonly helperText?: string;
  readonly onChange?: (value: string) => void;
  readonly onBlur?: () => void;
  readonly onFocus?: () => void;
  readonly autoComplete?: string;
  readonly autoFocus?: boolean;
  readonly maxLength?: number;
  readonly minLength?: number;
  readonly pattern?: string;
}

// Modal component props
export interface ModalProps extends BaseComponentProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  readonly closable?: boolean;
  readonly backdrop?: boolean;
  readonly centered?: boolean;
}

// Loading component props
export interface LoadingProps extends BaseComponentProps {
  readonly isLoading: boolean;
  readonly loadingText?: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
}

// Error component props
export interface ErrorProps extends BaseComponentProps {
  readonly error: string | Error;
  readonly onRetry?: () => void;
  readonly retryText?: string;
  readonly showDetails?: boolean;
}

// Card component props
export interface CardProps extends BaseComponentProps {
  readonly variant?: 'default' | 'outlined' | 'elevated';
  readonly padding?: 'none' | 'sm' | 'md' | 'lg';
  readonly shadow?: 'none' | 'sm' | 'md' | 'lg';
  readonly hover?: boolean;
  readonly clickable?: boolean;
  readonly onClick?: () => void;
}

// Trip card props
export interface TripCardProps extends BaseComponentProps {
  readonly trip: Trip;
  readonly onJoin?: (tripId: string) => void;
  readonly onView?: (tripId: string) => void;
  readonly showActions?: boolean;
  readonly variant?: 'grid' | 'list';
}

// User avatar props
export interface AvatarProps extends BaseComponentProps {
  readonly user: Pick<User, 'name' | 'profilePicture'>;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  readonly shape?: 'circle' | 'square';
  readonly showOnlineStatus?: boolean;
  readonly online?: boolean;
}

// Navigation props
export interface NavigationProps extends BaseComponentProps {
  readonly items: NavigationItem[];
  readonly activeItem?: string;
  readonly onItemClick?: (itemId: string) => void;
  readonly variant?: 'horizontal' | 'vertical';
  readonly collapsible?: boolean;
  readonly collapsed?: boolean;
  readonly onToggleCollapse?: () => void;
}

export interface NavigationItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: ReactNode;
  readonly href?: string;
  readonly badge?: number | string;
  readonly children?: NavigationItem[];
  readonly disabled?: boolean;
}

// Form component props
export interface FormProps extends BaseComponentProps {
  readonly onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  readonly initialValues?: Record<string, unknown>;
  readonly validationSchema?: unknown; // Yup or Zod schema
  readonly loading?: boolean;
  readonly resetOnSubmit?: boolean;
}

// Search component props
export interface SearchProps extends BaseComponentProps {
  readonly value: string;
  readonly placeholder?: string;
  readonly onSearch: (query: string) => void;
  readonly onClear?: () => void;
  readonly suggestions?: SearchSuggestion[];
  readonly loading?: boolean;
  readonly debounceMs?: number;
  readonly minLength?: number;
}

export interface SearchSuggestion {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly type?: 'trip' | 'user' | 'destination';
}

// Filter component props
export interface FilterProps extends BaseComponentProps {
  readonly filters: Record<string, unknown>;
  readonly onFiltersChange: (filters: Record<string, unknown>) => void;
  readonly onClear?: () => void;
  readonly availableFilters?: FilterOption[];
}

export interface FilterOption {
  readonly key: string;
  readonly label: string;
  readonly type: 'text' | 'select' | 'multiselect' | 'date' | 'number' | 'boolean';
  readonly options?: Array<{ value: string; label: string }>;
  readonly placeholder?: string;
}

// Chat message props
export interface ChatMessageProps extends BaseComponentProps {
  readonly message: ChatMessage;
  readonly isOwnMessage: boolean;
  readonly showAvatar?: boolean;
  readonly onReaction?: (messageId: string, emoji: string) => void;
  readonly onReply?: (message: ChatMessage) => void;
  readonly onEdit?: (messageId: string, content: string) => void;
  readonly onDelete?: (messageId: string) => void;
  readonly canEdit?: boolean;
  readonly canDelete?: boolean;
}

// Pagination props
export interface PaginationProps extends BaseComponentProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
  readonly showFirstLast?: boolean;
  readonly showPrevNext?: boolean;
  readonly maxVisiblePages?: number;
  readonly disabled?: boolean;
}

// Toast notification props
export interface ToastProps extends BaseComponentProps {
  readonly type?: 'success' | 'error' | 'warning' | 'info';
  readonly title?: string;
  readonly message: string;
  readonly duration?: number;
  readonly closable?: boolean;
  readonly onClose?: () => void;
  readonly action?: {
    label: string;
    onClick: () => void;
  };
}

// Layout component props
export interface LayoutProps extends BaseComponentProps {
  readonly header?: ReactNode;
  readonly sidebar?: ReactNode;
  readonly footer?: ReactNode;
  readonly sidebarCollapsed?: boolean;
  readonly onSidebarToggle?: () => void;
  readonly sidebarVariant?: 'overlay' | 'push' | 'static';
}

// Responsive component props
export interface ResponsiveProps extends BaseComponentProps {
  readonly mobile?: ReactNode;
  readonly tablet?: ReactNode;
  readonly desktop?: ReactNode;
  readonly breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

// Generic list component props
export interface ListProps<T = unknown> extends BaseComponentProps {
  readonly items: T[];
  readonly renderItem: (item: T, index: number) => ReactNode;
  readonly keyExtractor: (item: T, index: number) => string;
  readonly loading?: boolean;
  readonly error?: string;
  readonly emptyMessage?: string;
  readonly onRetry?: () => void;
  readonly virtualized?: boolean;
  readonly itemHeight?: number;
}

// Table component props
export interface TableProps<T = unknown> extends BaseComponentProps {
  readonly data: T[];
  readonly columns: TableColumn<T>[];
  readonly loading?: boolean;
  readonly error?: string;
  readonly onRowClick?: (item: T) => void;
  readonly sortable?: boolean;
  readonly onSort?: (column: string, direction: 'asc' | 'desc') => void;
  readonly pagination?: PaginationProps;
  readonly selectable?: boolean;
  readonly selectedItems?: T[];
  readonly onSelectionChange?: (items: T[]) => void;
}

export interface TableColumn<T = unknown> {
  readonly key: string;
  readonly label: string;
  readonly render?: (item: T) => ReactNode;
  readonly sortable?: boolean;
  readonly width?: string | number;
  readonly align?: 'left' | 'center' | 'right';
  readonly headerAlign?: 'left' | 'center' | 'right';
}

// Higher-order component types
export type WithLoadingProps = {
  readonly loading: boolean;
};

export type WithErrorProps = {
  readonly error: string | null;
};

export type WithAuthProps = {
  readonly user: User | null;
  readonly loading: boolean;
};

// Component ref types
export interface ComponentRef<T = HTMLElement> {
  readonly current: T | null;
}

// Authentication component props
export interface AuthFormProps extends BaseComponentProps {
  readonly title: string;
  readonly subtitle: string;
  readonly fields: AuthFormField[];
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly submitText: string;
  readonly isLoading: boolean;
  readonly generalError?: string;
  readonly footer?: ReactNode;
}

export interface AuthFormField {
  readonly id: string;
  readonly name: string;
  readonly type: 'text' | 'email' | 'password';
  readonly label: string;
  readonly placeholder: string;
  readonly value: string;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly autoComplete?: string;
  readonly required?: boolean;
}

export interface LoginFormProps extends BaseComponentProps {
  readonly onSubmit: (email: string, password: string) => Promise<void>;
  readonly loading?: boolean;
  readonly error?: string;
}

export interface SignupFormProps extends BaseComponentProps {
  readonly onSubmit: (data: SignupFormData) => Promise<void>;
  readonly loading?: boolean;
  readonly error?: string;
}

export interface SignupFormData {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
}

export interface ForgotPasswordFormProps extends BaseComponentProps {
  readonly onSubmit: (email: string) => Promise<void>;
  readonly loading?: boolean;
  readonly error?: string;
  readonly isSubmitted?: boolean;
}

export interface ProtectedRouteProps extends BaseComponentProps {
  readonly children: ReactNode;
  readonly redirectTo?: string;
  readonly requireAuth?: boolean;
}

// Form validation types
export interface FormValidationResult {
  readonly isValid: boolean;
  readonly errors: Record<string, string>;
}

export interface ValidationRule {
  readonly required?: boolean;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: RegExp;
  readonly custom?: (value: string) => string | null;
}

export interface FormFieldValidation {
  readonly [fieldName: string]: ValidationRule;
}

// Authentication state types
export interface AuthState {
  readonly user: User | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export interface AuthActions {
  readonly signIn: (email: string, password: string) => Promise<void>;
  readonly signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  readonly signOut: () => Promise<void>;
  readonly resetPassword: (email: string) => Promise<void>;
  readonly updateProfile: (updates: Partial<User>) => Promise<void>;
}

// Event handler types
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;
export type SubmitHandler<T = HTMLFormElement> = (event: React.FormEvent<T>) => void;
export type FocusHandler<T = HTMLElement> = (event: React.FocusEvent<T>) => void;
export type KeyboardHandler<T = HTMLElement> = (event: React.KeyboardEvent<T>) => void;
