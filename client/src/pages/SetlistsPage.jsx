import { useState, useEffect } from 'react';
import useSetlists from '/src/hooks/useSetlists.js';
import Layout from '/src/components/shared/Layout';
import SetlistList from '/src/components/setlists/SetlistList';
import CreateSetlistModal from '/src/components/modals/CreateSetlistModal';
import RenameModal from '/src/components/modals/RenameModal';
import ErrorMessage from '/src/components/shared/ErrorMessage';
import SuccessMessage from '/src/components/shared/SuccessMessage';

export default function SetlistsPage() {
  const { setlists, error, fetchSetlists, createSetlist, updateSetlist, deleteSetlist, clearError } = useSetlists();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [renameData, setRenameData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSetlists();
  }, [fetchSetlists]);

  useEffect(() => {
    fetchSetlists();
  }, [fetchSetlists]);

  const handleCreateSetlist = async (name) => {
    const success = await createSetlist(name);
    if (success) {
      setSuccessMessage(`Setlist "${name}" created successfully`);
    }
    return success;
  };

  const handleRenameSetlist = (setlist) => {
    setRenameData(setlist);
  };

  const handleRenameSubmit = async (newName) => {
    if (!renameData) return false;
    const success = await updateSetlist(renameData.id, newName);
    if (success) {
      setSuccessMessage(`Setlist renamed to "${newName}"`);
      setRenameData(null);
    }
    return success;
  };

  const handleDeleteSetlist = async (setlistId) => {
    const success = await deleteSetlist(setlistId);
    if (success) {
      setSuccessMessage('Setlist deleted successfully');
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
        >
          Create New Setlist
        </button>
      </div>

      <SetlistList
        setlists={setlists}
        onRename={handleRenameSetlist}
        onDelete={handleDeleteSetlist}
      />

      {/* Global notifications - now fixed positioned */}
      <ErrorMessage message={error} onClose={() => clearError()} />
      <SuccessMessage
        message={successMessage}
        onClose={() => setSuccessMessage('')}
      />

      <CreateSetlistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateSetlist}
      />

      <RenameModal
        isOpen={!!renameData}
        onClose={() => setRenameData(null)}
        onRename={handleRenameSubmit}
        currentName={renameData?.name}
        itemType="Setlist"
      />
    </Layout>
  );
}