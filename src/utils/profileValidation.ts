import type {
    DEFAULT_VALIDATION_RULES,
    ProfileFieldValidation,
    ProfileUpdate,
    ProfileValidationError,
    UserProfile
} from '@types/profile';

// Validation Error Codes
export enum ValidationErrorCode {
  REQUIRED = 'REQUIRED',
  INVALID_FORMAT = 'INVALID_FORMAT',
  TOO_SHORT = 'TOO_SHORT',
  TOO_LONG = 'TOO_LONG',
  INVALID_AGE = 'INVALID_AGE',
  INVALID_URL = 'INVALID_URL',
  INVALID_PHONE = 'INVALID_PHONE',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_DATE = 'INVALID_DATE',
  INVALID_CURRENCY = 'INVALID_CURRENCY',
  INVALID_LANGUAGE = 'INVALID_LANGUAGE',
  INVALID_TIMEZONE = 'INVALID_TIMEZONE',
  INVALID_COORDINATES = 'INVALID_COORDINATES',
  DUPLICATE_VALUE = 'DUPLICATE_VALUE',
  INVALID_SELECTION = 'INVALID_SELECTION',
}

// Validation Result Interface
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: ProfileValidationError[];
  readonly warnings: string[];
}

// Validation Context Interface
export interface ValidationContext {
  readonly field: string;
  readonly value: any;
  readonly profile?: Partial<UserProfile>;
  readonly rules?: ProfileFieldValidation;
}

// Custom Validation Function Type
export type ValidationFunction = (context: ValidationContext) => string | null;

// Validation Rules Registry
const validationRules: Record<string, ValidationFunction[]> = {
  name: [validateRequired, validateLength, validateNameFormat],
  firstName: [validateLength, validateNameFormat],
  lastName: [validateLength, validateNameFormat],
  email: [validateRequired, validateEmail],
  bio: [validateLength],
  phoneNumber: [validatePhone],
  dateOfBirth: [validateDateOfBirth],
  website: [validateUrl],
  instagram: [validateSocialHandle],
  twitter: [validateSocialHandle],
  facebook: [validateSocialHandle],
  linkedin: [validateLinkedIn],
  tiktok: [validateSocialHandle],
  youtube: [validateYouTube],
  country: [validateRequired, validateCountry],
  city: [validateLength],
  timezone: [validateTimezone],
  currency: [validateCurrency],
  language: [validateLanguage],
  interests: [validateInterests],
  destinations: [validateDestinations],
  budgetRange: [validateBudgetRange],
  coordinates: [validateCoordinates],
};

// Core Validation Functions

/**
 * Validates if a field is required and not empty
 */
export function validateRequired(context: ValidationContext): string | null {
  const { value, field } = context;
  const rules = context.rules?.[field as keyof ProfileFieldValidation];
  
  if (rules?.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return `${getFieldDisplayName(field)} is required`;
  }
  
  return null;
}

/**
 * Validates field length constraints
 */
export function validateLength(context: ValidationContext): string | null {
  const { value, field } = context;
  const rules = context.rules?.[field as keyof ProfileFieldValidation];
  
  if (typeof value === 'string') {
    const length = value.trim().length;
    
    if (rules?.minLength && length < rules.minLength) {
      return `${getFieldDisplayName(field)} must be at least ${rules.minLength} characters`;
    }
    
    if (rules?.maxLength && length > rules.maxLength) {
      return `${getFieldDisplayName(field)} must be no more than ${rules.maxLength} characters`;
    }
  }
  
  return null;
}

/**
 * Validates name format (letters, spaces, hyphens, apostrophes)
 */
export function validateNameFormat(context: ValidationContext): string | null {
  const { value } = context;
  
  if (typeof value === 'string' && value.trim()) {
    const namePattern = /^[a-zA-Z\s\-']+$/;
    if (!namePattern.test(value.trim())) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
  }
  
  return null;
}

/**
 * Validates email format
 */
export function validateEmail(context: ValidationContext): string | null {
  const { value } = context;
  
  if (typeof value === 'string' && value.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value.trim())) {
      return 'Please enter a valid email address';
    }
  }
  
  return null;
}

/**
 * Validates phone number format
 */
export function validatePhone(context: ValidationContext): string | null {
  const { value } = context;
  
  if (typeof value === 'string' && value.trim()) {
    const phonePattern = /^\+?[\d\s\-\(\)]+$/;
    if (!phonePattern.test(value.trim())) {
      return 'Please enter a valid phone number';
    }
    
    // Check if it's a reasonable length (7-15 digits)
    const digits = value.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      return 'Phone number must be between 7 and 15 digits';
    }
  }
  
  return null;
}

/**
 * Validates date of birth
 */
export function validateDateOfBirth(context: ValidationContext): string | null {
  const { value } = context;
  
  if (value) {
    const date = new Date(value);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
    
    if (age < 13) {
      return 'You must be at least 13 years old';
    }
    
    if (age > 120) {
      return 'Please enter a valid birth date';
    }
    
    if (date > now) {
      return 'Birth date cannot be in the future';
    }
  }
  
  return null;
}

/**
 * Validates URL format
 */
export function validateUrl(context: ValidationContext): string | null {
  const { value } = context;
  
  if (typeof value === 'string' && value.trim()) {
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'URL must start with http:// or https://';
      }
    } catch {
      return 'Please enter a valid URL';
    }
  }
  
  return null;
}

/**
 * Validates social media handles
 */
export function validateSocialHandle(context: ValidationContext): string | null {
  const { value, field } = context;
  
  if (typeof value === 'string' && value.trim()) {
    const handle = value.trim();
    
    // Remove @ symbol if present
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
    
    // Check for valid characters (letters, numbers, underscores, dots)
    const handlePattern = /^[a-zA-Z0-9_.]+$/;
    if (!handlePattern.test(cleanHandle)) {
      return `${getFieldDisplayName(field)} handle can only contain letters, numbers, underscores, and dots`;
    }
    
    // Check length
    if (cleanHandle.length < 1 || cleanHandle.length > 30) {
      return `${getFieldDisplayName(field)} handle must be between 1 and 30 characters`;
    }
  }
  
  return null;
}

/**
 * Validates LinkedIn profile URL
 */
export function validateLinkedIn(context: ValidationContext): string | null {
  const { value } = context;
  
  if (typeof value === 'string' && value.trim()) {
    const url = value.trim();
    
    if (!url.includes('linkedin.com')) {
      return 'Please enter a valid LinkedIn profile URL';
    }
    
    return validateUrl({ ...context, value: url });
  }
  
  return null;
}

/**
 * Validates YouTube channel URL
 */
export function validateYouTube(context: ValidationContext): string | null {
  const { value } = context;
  
  if (typeof value === 'string' && value.trim()) {
    const url = value.trim();
    
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return 'Please enter a valid YouTube channel URL';
    }
    
    return validateUrl({ ...context, value: url });
  }
  
  return null;
}

/**
 * Validates country code
 */
export function validateCountry(context: ValidationContext): string | null {
  const { value } = context;
  
  if (typeof value === 'string' && value.trim()) {
    // Basic country validation - should be a valid country name or code
    const countryPattern = /^[a-zA-Z\s\-']{2,50}$/;
    if (!countryPattern.test(value.trim())) {
      return 'Please enter a valid country name';
    }
  }
  
  return null;
}

/**
 * Validates timezone
 */
export function validateTimezone(context: ValidationContext): string | null {
  const { value } = context;
  
  if (typeof value === 'string' && value.trim()) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: value });
    } catch {
      return 'Please enter a valid timezone';
    }
  }
  
  return null;
}

/**
 * Validates currency code
 */
export function validateCurrency(context: ValidationContext): string | null {
  const { value } = context;
  
  if (typeof value === 'string' && value.trim()) {
    const currencyPattern = /^[A-Z]{3}$/;
    if (!currencyPattern.test(value.trim())) {
      return 'Please enter a valid 3-letter currency code (e.g., USD, EUR)';
    }
  }
  
  return null;
}

/**
 * Validates language code
 */
export function validateLanguage(context: ValidationContext): string | null {
  const { value } = context;
  
  if (typeof value === 'string' && value.trim()) {
    const languagePattern = /^[a-z]{2}(-[A-Z]{2})?$/;
    if (!languagePattern.test(value.trim())) {
      return 'Please enter a valid language code (e.g., en, en-US)';
    }
  }
  
  return null;
}

/**
 * Validates interests array
 */
export function validateInterests(context: ValidationContext): string | null {
  const { value } = context;
  
  if (Array.isArray(value)) {
    if (value.length > 20) {
      return 'You can select up to 20 interests';
    }
    
    for (const interest of value) {
      if (typeof interest !== 'string' || interest.trim().length === 0) {
        return 'All interests must be non-empty strings';
      }
      
      if (interest.trim().length > 50) {
        return 'Each interest must be 50 characters or less';
      }
    }
  }
  
  return null;
}

/**
 * Validates destinations array
 */
export function validateDestinations(context: ValidationContext): string | null {
  const { value } = context;
  
  if (Array.isArray(value)) {
    if (value.length > 50) {
      return 'You can select up to 50 destinations';
    }
    
    for (const destination of value) {
      if (typeof destination !== 'string' || destination.trim().length === 0) {
        return 'All destinations must be non-empty strings';
      }
      
      if (destination.trim().length > 100) {
        return 'Each destination must be 100 characters or less';
      }
    }
  }
  
  return null;
}

/**
 * Validates budget range
 */
export function validateBudgetRange(context: ValidationContext): string | null {
  const { value } = context;
  
  if (value && typeof value === 'object') {
    const { min, max, currency } = value;
    
    if (typeof min !== 'number' || typeof max !== 'number') {
      return 'Budget range must have valid min and max values';
    }
    
    if (min < 0 || max < 0) {
      return 'Budget values cannot be negative';
    }
    
    if (min > max) {
      return 'Minimum budget cannot be greater than maximum budget';
    }
    
    if (max > 1000000) {
      return 'Maximum budget cannot exceed 1,000,000';
    }
    
    if (!currency || typeof currency !== 'string') {
      return 'Currency is required';
    }
  }
  
  return null;
}

/**
 * Validates coordinates
 */
export function validateCoordinates(context: ValidationContext): string | null {
  const { value } = context;
  
  if (value && typeof value === 'object') {
    const { latitude, longitude } = value;
    
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return 'Coordinates must have valid latitude and longitude values';
    }
    
    if (latitude < -90 || latitude > 90) {
      return 'Latitude must be between -90 and 90 degrees';
    }
    
    if (longitude < -180 || longitude > 180) {
      return 'Longitude must be between -180 and 180 degrees';
    }
  }
  
  return null;
}

// Main Validation Functions

/**
 * Validates a single field
 */
export function validateField(
  field: string, 
  value: any, 
  profile?: Partial<UserProfile>,
  rules?: ProfileFieldValidation
): ProfileValidationError | null {
  const context: ValidationContext = {
    field,
    value,
    profile,
    rules: rules || DEFAULT_VALIDATION_RULES,
  };
  
  const fieldValidators = validationRules[field] || [];
  
  for (const validator of fieldValidators) {
    const error = validator(context);
    if (error) {
      return {
        field,
        message: error,
        code: getErrorCode(error),
      };
    }
  }
  
  return null;
}

/**
 * Validates a complete profile update
 */
export function validateProfileUpdate(
  update: ProfileUpdate,
  currentProfile?: Partial<UserProfile>
): ValidationResult {
  const errors: ProfileValidationError[] = [];
  const warnings: string[] = [];
  
  // Validate each field in the update
  for (const [field, value] of Object.entries(update)) {
    if (value !== undefined && value !== null) {
      const error = validateField(field, value, currentProfile);
      if (error) {
        errors.push(error);
      }
    }
  }
  
  // Cross-field validations
  if (update.firstName && update.lastName && !update.name) {
    warnings.push('Consider updating your full name when changing first or last name');
  }
  
  if (update.dateOfBirth && currentProfile?.dateOfBirth) {
    const newAge = new Date().getFullYear() - new Date(update.dateOfBirth).getFullYear();
    const currentAge = new Date().getFullYear() - new Date(currentProfile.dateOfBirth).getFullYear();
    
    if (Math.abs(newAge - currentAge) > 1) {
      warnings.push('Significant age change detected. Please verify your birth date.');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates a complete user profile
 */
export function validateUserProfile(profile: Partial<UserProfile>): ValidationResult {
  const errors: ProfileValidationError[] = [];
  const warnings: string[] = [];
  
  // Required fields validation
  const requiredFields = ['id', 'email', 'name'];
  for (const field of requiredFields) {
    if (!profile[field as keyof UserProfile]) {
      errors.push({
        field,
        message: `${getFieldDisplayName(field)} is required`,
        code: ValidationErrorCode.REQUIRED,
      });
    }
  }
  
  // Validate all fields
  for (const [field, value] of Object.entries(profile)) {
    if (value !== undefined && value !== null) {
      const error = validateField(field, value, profile);
      if (error) {
        errors.push(error);
      }
    }
  }
  
  // Profile completion warnings
  const completion = calculateProfileCompletion(profile);
  if (completion < 50) {
    warnings.push('Your profile is less than 50% complete. Consider adding more information.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculates profile completion percentage
 */
export function calculateProfileCompletion(profile: Partial<UserProfile>): number {
  const fields = [
    'name', 'email', 'bio', 'dateOfBirth', 'phoneNumber', 'location',
    'profilePicture', 'travelPreferences', 'socialLinks'
  ];
  
  let completedFields = 0;
  
  for (const field of fields) {
    const value = profile[field as keyof UserProfile];
    if (value !== undefined && value !== null) {
      if (typeof value === 'string' && value.trim()) {
        completedFields++;
      } else if (typeof value === 'object' && Object.keys(value).length > 0) {
        completedFields++;
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        completedFields++;
      }
    }
  }
  
  return Math.round((completedFields / fields.length) * 100);
}

// Utility Functions

/**
 * Gets display name for a field
 */
function getFieldDisplayName(field: string): string {
  const displayNames: Record<string, string> = {
    firstName: 'First name',
    lastName: 'Last name',
    dateOfBirth: 'Date of birth',
    phoneNumber: 'Phone number',
    profilePicture: 'Profile picture',
    travelPreferences: 'Travel preferences',
    privacySettings: 'Privacy settings',
    notificationSettings: 'Notification settings',
    accountSettings: 'Account settings',
  };
  
  return displayNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

/**
 * Gets error code from error message
 */
function getErrorCode(message: string): ValidationErrorCode {
  if (message.includes('required')) return ValidationErrorCode.REQUIRED;
  if (message.includes('valid')) return ValidationErrorCode.INVALID_FORMAT;
  if (message.includes('at least')) return ValidationErrorCode.TOO_SHORT;
  if (message.includes('no more than')) return ValidationErrorCode.TOO_LONG;
  if (message.includes('age')) return ValidationErrorCode.INVALID_AGE;
  if (message.includes('URL')) return ValidationErrorCode.INVALID_URL;
  if (message.includes('phone')) return ValidationErrorCode.INVALID_PHONE;
  if (message.includes('email')) return ValidationErrorCode.INVALID_EMAIL;
  if (message.includes('date')) return ValidationErrorCode.INVALID_DATE;
  if (message.includes('currency')) return ValidationErrorCode.INVALID_CURRENCY;
  if (message.includes('language')) return ValidationErrorCode.INVALID_LANGUAGE;
  if (message.includes('timezone')) return ValidationErrorCode.INVALID_TIMEZONE;
  if (message.includes('coordinates')) return ValidationErrorCode.INVALID_COORDINATES;
  
  return ValidationErrorCode.INVALID_FORMAT;
}

/**
 * Sanitizes profile data by removing invalid characters and trimming strings
 */
export function sanitizeProfileData(data: any): any {
  if (typeof data === 'string') {
    return data.trim();
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeProfileData(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeProfileData(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Formats validation errors for display
 */
export function formatValidationErrors(errors: ProfileValidationError[]): string[] {
  return errors.map(error => `${getFieldDisplayName(error.field)}: ${error.message}`);
}

/**
 * Gets validation summary
 */
export function getValidationSummary(result: ValidationResult): string {
  if (result.isValid) {
    return 'Profile is valid';
  }
  
  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;
  
  let summary = `${errorCount} error${errorCount !== 1 ? 's' : ''}`;
  if (warningCount > 0) {
    summary += ` and ${warningCount} warning${warningCount !== 1 ? 's' : ''}`;
  }
  
  return summary;
}
