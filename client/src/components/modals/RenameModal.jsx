import { useState, useEffect } from 'react';
import Modal from '../shared/Modal';

export default function RenameModal({ isOpen, onClose, onRename, currentName, itemType = 'item' }) {
  const [name, setName] = useState(currentName || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(currentName || '');
  }, [currentName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === currentName) return;

    setLoading(true);
    try {
      const success = await onRename(name.trim());
      if (success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName(currentName || '');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Rename ${itemType}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rename-input" className="block text-sm font-medium text-gray-300 mb-2">
            New Name
          </label>
          <input
            id="rename-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            placeholder={`Enter new ${itemType.toLowerCase()} name...`}
            disabled={loading}
            autoFocus
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 rounded-md font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim() || name.trim() === currentName}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-md font-medium transition-colors"
          >
            {loading ? 'Renaming...' : 'Rename'}
          </button>
        </div>
      </form>
    </Modal>
  );
}