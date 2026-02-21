import { useState, useCallback } from 'react';

function useSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/songs');
      if (!response.ok) throw new Error('Failed to fetch songs');
      const data = await response.json();
      setSongs(data);
      setError('');
    } catch (error) {
      setError('Failed to load songs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSong = useCallback(async (songData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songData)
      });
      if (!response.ok) throw new Error('Failed to create song');
      await fetchSongs(); // Refresh the list
      setError('');
      return true;
    } catch (error) {
      setError('Failed to save song');
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSongs]);

  const updateSong = useCallback(async (id, songData) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/songs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songData)
      });
      if (!response.ok) throw new Error('Failed to update song');
      await fetchSongs(); // Refresh the list
      setError('');
      return true;
    } catch (error) {
      setError('Failed to update song');
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSongs]);

  const deleteSong = useCallback(async (id) => {
    if (!confirm('Are you sure you want to delete this song?')) return false;
    try {
      setLoading(true);
      const response = await fetch(`/api/songs/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete song');
      await fetchSongs(); // Refresh the list
      setError('');
      return true;
    } catch (error) {
      setError('Failed to delete song');
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSongs]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    songs,
    loading,
    error,
    fetchSongs,
    createSong,
    updateSong,
    deleteSong,
    clearError
  };
}

export default useSongs;