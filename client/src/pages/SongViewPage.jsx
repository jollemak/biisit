import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useSongs from '/src/hooks/useSongs.js';
import useSetlistSongs from '/src/hooks/useSetlistSongs.js';
import Layout from '/src/components/shared/Layout';
import LoadingSpinner from '/src/components/shared/LoadingSpinner';
import SongNavigation from '/src/components/songs/SongNavigation';

export default function SongViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { songs, loading: songsLoading, fetchSongs } = useSongs();
  const setlistId = searchParams.get('setlist');
  const { setlistSongs, loading: setlistLoading, fetchSetlistSongs } = useSetlistSongs(setlistId ? parseInt(setlistId) : null);

  const [song, setSong] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Determine which songs array to use for navigation
  const navigationSongs = useMemo(() => {
    return setlistId ? setlistSongs : songs;
  }, [setlistId, setlistSongs, songs]);

  // Find current song index in navigation array
  const currentSongIndex = useMemo(() => {
    return navigationSongs.findIndex(s => s.id === parseInt(id));
  }, [navigationSongs, id]);

  useEffect(() => {
    fetchSongs().then(() => setDataLoaded(true));
    if (setlistId) {
      fetchSetlistSongs();
    }
  }, [fetchSongs, setlistId, fetchSetlistSongs]);

  useEffect(() => {
    if (!dataLoaded) return; // Wait for data to load
    
    const foundSong = songs.find(s => s.id === parseInt(id));
    if (foundSong) {
      setSong(foundSong); // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      // Data is loaded but song not found - now we can redirect
      navigate('/');
    }
  }, [id, songs, dataLoaded, navigate]);

  const handleEdit = () => {
    navigate(`/songs/${id}/edit`);
  };

  const handleBack = () => {
    if (setlistId) {
      navigate(`/setlists/${setlistId}`);
    } else {
      navigate('/');
    }
  };

  const handlePrevious = () => {
    if (navigationSongs.length === 0) return;
    
    const prevIndex = currentSongIndex <= 0 ? navigationSongs.length - 1 : currentSongIndex - 1;
    const prevSong = navigationSongs[prevIndex];
    
    if (prevSong) {
      const newUrl = setlistId ? `/songs/${prevSong.id}?setlist=${setlistId}` : `/songs/${prevSong.id}`;
      navigate(newUrl);
    }
  };

  const handleNext = () => {
    if (navigationSongs.length === 0) return;
    
    const nextIndex = currentSongIndex >= navigationSongs.length - 1 ? 0 : currentSongIndex + 1;
    const nextSong = navigationSongs[nextIndex];
    
    if (nextSong) {
      const newUrl = setlistId ? `/songs/${nextSong.id}?setlist=${setlistId}` : `/songs/${nextSong.id}`;
      navigate(newUrl);
    }
  };

  if (songsLoading || (setlistId && setlistLoading) || !dataLoaded) {
    return (
      <Layout>
        <LoadingSpinner message="Loading song..." />
      </Layout>
    );
  }

  if (!song) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-400">
          Song not found.
        </div>
      </Layout>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleEdit}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Edit Song
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-5xl font-bold mb-12">{song.title}</h1>
          <div className="text-left text-2xl leading-relaxed whitespace-pre-line">
            {song.lyrics}
          </div>
        </div>
      </div>

      {/* Floating navigation buttons */}
      <SongNavigation
        onPrevious={handlePrevious}
        onNext={handleNext}
        disabled={navigationSongs.length <= 1}
      />
    </div>
  );
}