import { useState, useEffect, useRef } from 'react';
import CreateSetlistModal from '../modals/CreateSetlistModal';

export default function AddToSetlistDropdown({ songId, setlists, onAdd, onCreateNew }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToSetlist = async (setlistId) => {
    const success = await onAdd(setlistId, songId);
    if (success) {
      setIsOpen(false);
    }
  };

  const handleCreateNew = async (name) => {
    const success = await onCreateNew(name);
    if (success) {
      setShowCreateModal(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
          title="Add to Setlist"
        >
          +
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-300 mb-2">Add to Setlist</div>
              {setlists.length === 0 ? (
                <div className="text-xs text-gray-500 p-2">No setlists yet</div>
              ) : (
                setlists.map(setlist => (
                  <button
                    key={setlist.id}
                    onClick={() => handleAddToSetlist(setlist.id)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded transition-colors"
                  >
                    {setlist.name}
                  </button>
                ))
              )}
              <hr className="my-2 border-gray-600" />
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-gray-700 rounded transition-colors"
              >
                + Create New Setlist
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateSetlistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateNew}
      />
    </>
  );
}