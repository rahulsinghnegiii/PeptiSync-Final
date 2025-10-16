/**
 * Hook for sanitizing form inputs
 */

import { useState, useCallback } from 'react';
import { sanitizeUserInput } from '@/lib/inputSanitization';

export const useSanitizedInput = (initialValue: string = '') => {
  const [value, setValue] = useState(initialValue);
  const [sanitizedValue, setSanitizedValue] = useState(sanitizeUserInput(initialValue));

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    setSanitizedValue(sanitizeUserInput(newValue));
  }, []);

  const reset = useCallback(() => {
    setValue('');
    setSanitizedValue('');
  }, []);

  return {
    value,
    sanitizedValue,
    handleChange,
    reset,
  };
};
