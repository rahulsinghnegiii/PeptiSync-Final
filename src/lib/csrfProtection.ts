/**
 * CSRF (Cross-Site Request Forgery) protection utilities
 */

const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_TOKEN_HEADER = 'X-CSRF-Token';

/**
 * Generate a random CSRF token
 */
export const generateCsrfToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Store CSRF token in session storage
 */
export const storeCsrfToken = (token: string): void => {
  sessionStorage.setItem(CSRF_TOKEN_KEY, token);
};

/**
 * Get CSRF token from session storage
 */
export const getCsrfToken = (): string | null => {
  return sessionStorage.getItem(CSRF_TOKEN_KEY);
};

/**
 * Initialize CSRF token if not exists
 */
export const initializeCsrfToken = (): string => {
  let token = getCsrfToken();
  
  if (!token) {
    token = generateCsrfToken();
    storeCsrfToken(token);
  }
  
  return token;
};

/**
 * Clear CSRF token (call on logout)
 */
export const clearCsrfToken = (): void => {
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
};

/**
 * Validate CSRF token
 */
export const validateCsrfToken = (token: string): boolean => {
  const storedToken = getCsrfToken();
  return storedToken !== null && storedToken === token;
};

/**
 * Add CSRF token to form data
 */
export const addCsrfTokenToFormData = (formData: FormData): FormData => {
  const token = getCsrfToken();
  if (token) {
    formData.append('csrf_token', token);
  }
  return formData;
};

/**
 * Add CSRF token to request headers
 */
export const getCsrfHeaders = (): Record<string, string> => {
  const token = getCsrfToken();
  return token ? { [CSRF_TOKEN_HEADER]: token } : {};
};

/**
 * Create a protected fetch wrapper with CSRF token
 */
export const protectedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const csrfHeaders = getCsrfHeaders();
  
  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      ...csrfHeaders,
    },
  };
  
  return fetch(url, mergedOptions);
};

/**
 * Hook to use CSRF protection in forms
 */
export const useCsrfProtection = () => {
  const token = initializeCsrfToken();
  
  return {
    token,
    headers: getCsrfHeaders(),
    addToFormData: addCsrfTokenToFormData,
    validate: validateCsrfToken,
  };
};
