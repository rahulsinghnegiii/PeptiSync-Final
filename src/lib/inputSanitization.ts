/**
 * Input sanitization utilities to prevent XSS attacks
 */

/**
 * Sanitize HTML string by removing potentially dangerous tags and attributes
 */
export const sanitizeHtml = (input: string): string => {
  // Create a temporary div element
  const temp = document.createElement('div');
  temp.textContent = input;
  return temp.innerHTML;
};

/**
 * Escape HTML special characters
 */
export const escapeHtml = (input: string): string => {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
};

/**
 * Remove script tags and event handlers from input
 */
export const removeScripts = (input: string): string => {
  // Remove script tags
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
};

/**
 * Sanitize user input for safe display
 */
export const sanitizeUserInput = (input: string): string => {
  if (!input) return '';
  
  // First escape HTML
  let sanitized = escapeHtml(input);
  
  // Then remove any remaining scripts
  sanitized = removeScripts(sanitized);
  
  return sanitized.trim();
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email: string): string => {
  // Remove any whitespace
  let sanitized = email.trim().toLowerCase();
  
  // Basic email validation pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailPattern.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
};

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export const sanitizeUrl = (url: string): string => {
  const sanitized = url.trim();
  
  // Check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = sanitized.toLowerCase();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '#';
    }
  }
  
  // Only allow http, https, and relative URLs
  if (sanitized.startsWith('http://') || 
      sanitized.startsWith('https://') || 
      sanitized.startsWith('/') ||
      sanitized.startsWith('#')) {
    return sanitized;
  }
  
  // Default to relative URL
  return `/${sanitized}`;
};

/**
 * Sanitize filename to prevent path traversal
 */
export const sanitizeFilename = (filename: string): string => {
  // Remove path separators and special characters
  let sanitized = filename.replace(/[\/\\]/g, '');
  
  // Remove leading dots to prevent hidden files
  sanitized = sanitized.replace(/^\.+/, '');
  
  // Only allow alphanumeric, dash, underscore, and dot
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    const name = sanitized.substring(0, 250 - (ext?.length || 0));
    sanitized = ext ? `${name}.${ext}` : name;
  }
  
  return sanitized;
};

/**
 * Validate and sanitize numeric input
 */
export const sanitizeNumber = (input: string | number, options?: {
  min?: number;
  max?: number;
  integer?: boolean;
}): number => {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num)) {
    throw new Error('Invalid number');
  }
  
  let sanitized = num;
  
  if (options?.integer) {
    sanitized = Math.floor(sanitized);
  }
  
  if (options?.min !== undefined && sanitized < options.min) {
    sanitized = options.min;
  }
  
  if (options?.max !== undefined && sanitized > options.max) {
    sanitized = options.max;
  }
  
  return sanitized;
};

/**
 * Sanitize SQL-like input to prevent SQL injection
 * Note: This is a backup - always use parameterized queries
 */
export const sanitizeSqlInput = (input: string): string => {
  // Remove SQL keywords and special characters
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'EXEC', 'EXECUTE', 'UNION', 'DECLARE', '--', '/*', '*/', ';'
  ];
  
  let sanitized = input;
  
  for (const keyword of sqlKeywords) {
    const regex = new RegExp(keyword, 'gi');
    sanitized = sanitized.replace(regex, '');
  }
  
  // Remove single quotes (use parameterized queries instead)
  sanitized = sanitized.replace(/'/g, "''");
  
  return sanitized.trim();
};
