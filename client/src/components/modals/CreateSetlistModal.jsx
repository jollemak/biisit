import { useState } from 'react';
import Modal from '../shared/Modal';

export default function CreateSetlistModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const success = await onCreate(name.trim());
      if (success) {
        setName('');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Setlist">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="setlist-name" className="block text-sm font-medium text-gray-300 mb-2">
            Setlist Name
          </label>
          <input
            id="setlist-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="Enter setlist name..."
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
            disabled={loading || !name.trim()}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-md font-medium transition-colors"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}