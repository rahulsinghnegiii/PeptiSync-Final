import { useEffect, useState } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  clearDelay?: number;
}

/**
 * LiveRegion component for announcing dynamic content updates to screen readers
 * Uses aria-live regions to communicate changes without interrupting the user
 */
export const LiveRegion = ({ 
  message, 
  politeness = 'polite',
  clearDelay = 5000 
}: LiveRegionProps) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      
      // Clear the announcement after a delay to allow for new announcements
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, clearDelay);

      return () => clearTimeout(timer);
    }
  }, [message, clearDelay]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};

/**
 * Hook for managing live region announcements
 */
export const useLiveAnnouncer = () => {
  const [message, setMessage] = useState('');

  const announce = (text: string) => {
    setMessage(text);
  };

  return { message, announce };
};
