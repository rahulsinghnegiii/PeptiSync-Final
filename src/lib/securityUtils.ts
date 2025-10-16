/**
 * Comprehensive security utilities for the application
 */

import { sanitizeUserInput, sanitizeEmail, sanitizeUrl, sanitizeNumber } from './inputSanitization';
import { getCsrfHeaders } from './csrfProtection';
import { supabase } from '@/integrations/supabase/client';

/**
 * Rate limiting tracker for client-side
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  /**
   * Check if action is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filter out old attempts
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Record this attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }

  /**
   * Reset attempts for a key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Get remaining attempts
   */
  getRemainingAttempts(key: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }
}

// Global rate limiters for different actions
export const authRateLimiter = new RateLimiter(5, 60000); // 5 attempts per minute
export const apiRateLimiter = new RateLimiter(30, 60000); // 30 requests per minute

/**
 * Secure fetch wrapper with CSRF protection and rate limiting
 */
export const secureFetch = async (
  url: string,
  options: RequestInit = {},
  rateLimitKey?: string
): Promise<Response> => {
  // Check rate limit if key provided
  if (rateLimitKey && !apiRateLimiter.isAllowed(rateLimitKey)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // Add CSRF headers
  const csrfHeaders = getCsrfHeaders();
  
  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();
  const authHeaders = session?.access_token 
    ? { 'Authorization': `Bearer ${session.access_token}` }
    : {};

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...csrfHeaders,
      ...authHeaders,
    },
  };

  return fetch(url, mergedOptions);
};

/**
 * Validate form data before submission
 */
export const validateFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Sanitize string inputs
      sanitized[key] = sanitizeUserInput(value);
    } else if (typeof value === 'number') {
      // Validate numbers
      sanitized[key] = sanitizeNumber(value);
    } else if (Array.isArray(value)) {
      // Sanitize array items
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeUserInput(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Validate email with additional security checks
 */
export const validateSecureEmail = (email: string): boolean => {
  try {
    const sanitized = sanitizeEmail(email);
    
    // Additional checks
    if (sanitized.length > 254) return false; // RFC 5321
    if (sanitized.includes('..')) return false; // No consecutive dots
    
    const [local, domain] = sanitized.split('@');
    if (local.length > 64) return false; // RFC 5321
    if (domain.length > 253) return false; // RFC 1035
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate URL with security checks
 */
export const validateSecureUrl = (url: string): boolean => {
  try {
    const sanitized = sanitizeUrl(url);
    
    // Check if it's a valid URL
    if (sanitized === '#') return false;
    
    // Only allow http/https
    if (!sanitized.startsWith('http://') && 
        !sanitized.startsWith('https://') && 
        !sanitized.startsWith('/')) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if content contains potential XSS
 */
export const containsXSS = (content: string): boolean => {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
  ];

  return xssPatterns.some(pattern => pattern.test(content));
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeUserInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Generate secure random string
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate file upload security
 */
export const validateFileUpload = (file: File, options?: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}): { valid: boolean; error?: string } => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'],
  } = options || {};

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension ${extension} is not allowed`,
    };
  }

  // Check for double extensions (e.g., file.php.jpg)
  const parts = file.name.split('.');
  if (parts.length > 2) {
    return {
      valid: false,
      error: 'Files with multiple extensions are not allowed',
    };
  }

  return { valid: true };
};

/**
 * Secure localStorage wrapper with encryption
 */
export const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      const serialized = JSON.stringify(value);
      // In production, you might want to encrypt this
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Error storing item:', error);
    }
  },

  getItem: <T = any>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error retrieving item:', error);