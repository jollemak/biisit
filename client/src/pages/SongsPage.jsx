import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSongs from '/src/hooks/useSongs.js';
import useSetlists from '/src/hooks/useSetlists.js';
import useSetlistSongs from '/src/hooks/useSetlistSongs.js';
import Layout from '/src/components/shared/Layout';
import SearchBar from '/src/components/songs/SearchBar';
import SongList from '/src/components/songs/SongList';
import ErrorMessage from '/src/components/shared/ErrorMessage';
import SuccessMessage from '/src/components/shared/SuccessMessage';

export default function SongsPage() {
  const navigate = useNavigate();
  const { songs, error, fetchSongs, deleteSong, clearError } = useSongs();
  const { setlists, fetchSetlists, createSetlist } = useSetlists();
  const { addSongToSetlist, error: setlistError, clearError: clearSetlistError } = useSetlistSongs();

  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSongs();
    fetchSetlists();
  }, [fetchSongs, fetchSetlists]);

  const filteredSongs = useMemo(() => {
    return songs.filter(song =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [songs, searchQuery]);

  const handleAddSong = () => {
    navigate('/songs/new');
  };

  const handleEditSong = (song) => {
    navigate(`/songs/${song.id}/edit`);
  };

  const handleDeleteSong = async (songId) => {
    const success = await deleteSong(songId);
    if (success) {
      setSuccessMessage('Song deleted successfully');
    }
  };

  const handleAddToSetlist = async (setlistId, songId) => {
    const success = await addSongToSetlist(setlistId, songId);
    if (success) {
      await fetchSetlists(); // Update setlist counts
      const setlist = setlists.find(s => s.id === setlistId);
      const setlistName = setlist ? setlist.name : 'setlist';
      setSuccessMessage(`Song added to "${setlistName}"`);
    }
    return success;
  };

  const handleCreateSetlist = async (name) => {
    const success = await createSetlist(name);
    if (success) {
      setSuccessMessage(`Setlist "${name}" created successfully`);
    }
    return success;
  };

  return (
    <Layout>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onAddNew={handleAddSong}
      />

      <SongList
        songs={filteredSongs}
        onEdit={handleEditSong}
        onDelete={handleDeleteSong}
        setlists={setlists}
        onAddToSetlist={handleAddToSetlist}
        onCreateSetlist={handleCreateSetlist}
      />

      {/* Global notifications - now fixed positioned */}
      <ErrorMessage 
        message={error || setlistError} 
        onClose={() => {
          if (error) clearError();
          if (setlistError) clearSetlistError();
        }} 
      />
      <SuccessMessage
        message={successMessage}
        onClose={() => setSuccessMessage('')}
      />
    </Layout>
  );
}