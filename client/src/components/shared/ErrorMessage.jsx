export default function ErrorMessage({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="bg-red-600 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
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