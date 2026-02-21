import { useEffect } from 'react';

export default function SuccessMessage({ message, duration = 3000, onClose }) {
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
    <div className="bg-green-600 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-green-200 hover:text-white font-bold"
          aria-label="Close success message"
        >
          ×
        </button>
      )}
    </div>
  );
}