/**
 * React hook for CSRF protection in forms
 */

import { useEffect, useState } from 'react';
import { 
  initializeCsrfToken, 
  getCsrfToken, 
  getCsrfHeaders,
  addCsrfTokenToFormData,
  validateCsrfToken 
} from '@/lib/csrfProtection';

export const useCsrfProtection = () => {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const csrfToken = initializeCsrfToken();
    setToken(csrfToken);
  }, []);

  return {
    token,
    headers: getCsrfHeaders(),
    addToFormData: addCsrfTokenToFormData,
    validate: validateCsrfToken,
    getToken: getCsrfToken,
  };
};
