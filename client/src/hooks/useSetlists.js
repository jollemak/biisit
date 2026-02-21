import { useState, useCallback } from 'react';

function useSetlists() {
  const [setlists, setSetlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSetlists = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/setlists');
      if (!response.ok) throw new Error('Failed to fetch setlists');
      const data = await response.json();
      setSetlists(data);
      setError('');
    } catch (error) {
      setError('Failed to load setlists');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSetlist = useCallback(async (name) => {
    try {
      setLoading(true);
      const response = await fetch('/api/setlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!response.ok) throw new Error('Failed to create setlist');
      await fetchSetlists(); // Refresh the list
      setError('');
      return true;
    } catch (error) {
      setError('Failed to create setlist');
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSetlists]);

  const updateSetlist = useCallback(async (id, name) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/setlists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!response.ok) throw new Error('Failed to update setlist');
      await fetchSetlists(); // Refresh the list
      setError('');
      return true;
    } catch (error) {
      setError('Failed to update setlist');
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSetlists]);

  const deleteSetlist = useCallback(async (id) => {
    if (!confirm('Are you sure you want to delete this setlist?')) return false;
    try {
      setLoading(true);
      const response = await fetch(`/api/setlists/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete setlist');
      await fetchSetlists(); // Refresh the list
      setError('');
      return true;
    } catch (error) {
      setError('Failed to delete setlist');
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSetlists]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    setlists,
    loading,
    error,
    fetchSetlists,
    createSetlist,
    updateSetlist,
    deleteSetlist,
    clearError
  };
}

export default useSetlists;