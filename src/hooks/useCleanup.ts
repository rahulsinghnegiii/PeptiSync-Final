import { useEffect, useRef } from 'react';

/**
 * Hook for automatic cleanup of event listeners and subscriptions
 * Prevents memory leaks by ensuring all cleanup functions are called on unmount
 */
export function useCleanup() {
  const cleanupFns = useRef<Array<() => void>>([]);

  const addCleanup = (fn: () => void) => {
    cleanupFns.current.push(fn);
  };

  useEffect(() => {
    return () => {
      // Call all cleanup functions on unmount
      cleanupFns.current.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      });
      cleanupFns.current = [];
    };
  }, []);

  return { addCleanup };
}

/**
 * Hook for managing event listeners with automatic cleanup
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement = window,
  options?: boolean | AddEventListenerOptions
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    const eventListener = (event: Event) => savedHandler.current(event as WindowEventMap[K]);
    element.addEventListener(eventName, eventListener, options);

    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}
