import { useEffect } from 'react';

export default function ErrorMessage({ message, duration=2000, onClose }) {
  useEffect(() => {
    if (message && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between max-w-sm">
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-red-200 hover:text-white font-bold"
          aria-label="Close error message"
        >
          ×
        </button>
      )}
    </div>
  );
}