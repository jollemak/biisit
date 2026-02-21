import { useState, useCallback } from 'react';

function useSetlistSongs(setlistId) {
  const [setlistSongs, setSetlistSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSetlistSongs = useCallback(async (id = setlistId) => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/setlists/${id}/songs`);
      if (!response.ok) throw new Error('Failed to fetch setlist songs');
      const data = await response.json();
      setSetlistSongs(data);
      setError('');
    } catch (error) {
      setError('Failed to load setlist songs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [setlistId]);

  const addSongToSetlist = useCallback(async (setlistId, songId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/setlists/${setlistId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song_id: songId })
      });

      if (response.status === 409) {
        setError('Song already in setlist');
        return false;
      }

      if (!response.ok) throw new Error('Failed to add song to setlist');

      // Refresh setlists to update song counts
      await fetchSetlistSongs(setlistId);
      setError('');
      return true;
    } catch (error) {
      setError('Failed to add song to setlist');
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSetlistSongs]);

  const removeSongFromSetlist = useCallback(async (setlistId, songId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/setlists/${setlistId}/songs/${songId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to remove song from setlist');

      await fetchSetlistSongs(setlistId);
      setError('');
      return true;
    } catch (error) {
      setError('Failed to remove song from setlist');
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSetlistSongs]);

  const reorderSetlistSongs = useCallback(async (setlistId, songPositions) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/setlists/${setlistId}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs: songPositions })
      });
      if (!response.ok) throw new Error('Failed to reorder songs');
      await fetchSetlistSongs(setlistId);
      setError('');
      return true;
    } catch (error) {
      setError('Failed to reorder songs');
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSetlistSongs]);

  return {
    setlistSongs,
    loading,
    error,
    fetchSetlistSongs,
    addSongToSetlist,
    removeSongFromSetlist,
    reorderSetlistSongs
  };
}

export default useSetlistSongs;