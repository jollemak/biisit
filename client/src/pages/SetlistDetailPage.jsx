import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSetlists from '/src/hooks/useSetlists.js';
import useSetlistSongs from '/src/hooks/useSetlistSongs.js';
import Layout from '/src/components/shared/Layout';
import LoadingSpinner from '/src/components/shared/LoadingSpinner';
import SetlistSongList from '/src/components/setlists/SetlistSongList';
import RenameModal from '/src/components/modals/RenameModal';
import ErrorMessage from '/src/components/shared/ErrorMessage';
import SuccessMessage from '/src/components/shared/SuccessMessage';

export default function SetlistDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setlists, loading: setlistsLoading, fetchSetlists, updateSetlist } = useSetlists();
  const {
    setlistSongs,
    loading,
    error,
    fetchSetlistSongs,
    removeSongFromSetlist,
    reorderSetlistSongs,
    clearError
  } = useSetlistSongs(parseInt(id));

  const [currentSetlist, setCurrentSetlist] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    fetchSetlists().then(() => setDataLoaded(true));
  }, [fetchSetlists]);

  useEffect(() => {
    if (!dataLoaded) return; // Wait for data to load
    
    const setlist = setlists.find(s => s.id === parseInt(id));
    if (setlist) {
      if (!currentSetlist || currentSetlist.id !== setlist.id) {
        setCurrentSetlist(setlist); // eslint-disable-line react-hooks/set-state-in-effect
      }
    } else {
      // Data is loaded but setlist not found - now we can redirect
      navigate('/setlists');
    }
  }, [id, setlists, dataLoaded, navigate, currentSetlist]);

  useEffect(() => {
    if (currentSetlist) {
      fetchSetlistSongs();
    }
  }, [currentSetlist, fetchSetlistSongs]);

  const handleBack = () => {
    navigate('/setlists');
  };

  const handleRename = () => {
    setShowRenameModal(true);
  };

  const handleRenameSubmit = async (newName) => {
    const success = await updateSetlist(currentSetlist.id, newName);
    if (success) {
      setCurrentSetlist({...currentSetlist, name: newName});
      setSuccessMessage(`Setlist renamed to "${newName}"`);
      setShowRenameModal(false);
    }
    return success;
  };

  const handleRemoveSong = async (songId) => {
    const success = await removeSongFromSetlist(currentSetlist.id, songId);
    if (success) {
      setSuccessMessage('Song removed from setlist');
    }
  };

  const handleReorder = async (reorderedSongs) => {
    const songPositions = reorderedSongs.map((song, index) => ({
      song_id: song.id,
      position: index
    }));
    await reorderSetlistSongs(currentSetlist.id, songPositions);
  };

  if (setlistsLoading || !dataLoaded) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!currentSetlist) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-400">
          Setlist not found.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors mb-2"
          >
            ← Back to Setlists
          </button>
          <h1 className="text-3xl font-bold">{currentSetlist.name}</h1>
        </div>
        <button
          onClick={handleRename}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Rename Setlist
        </button>
      </div>

      <SetlistSongList
        songs={setlistSongs}
        onRemove={handleRemoveSong}
        onReorder={handleReorder}
        loading={loading}
        setlistId={parseInt(id)}
      />

      <RenameModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onRename={handleRenameSubmit}
        currentName={currentSetlist.name}
        itemType="Setlist"
      />

      {/* Global notifications - now fixed positioned */}
      <ErrorMessage message={error} onClose={() => clearError()} />
      <SuccessMessage
        message={successMessage}
        onClose={() => setSuccessMessage('')}
      />
    </Layout>
  );
}