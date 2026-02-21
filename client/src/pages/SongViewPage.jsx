import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSongs from '/src/hooks/useSongs.js';
import Layout from '/src/components/shared/Layout';
import LoadingSpinner from '/src/components/shared/LoadingSpinner';

export default function SongViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { songs, loading: songsLoading, fetchSongs } = useSongs();

  const [song, setSong] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    fetchSongs().then(() => setDataLoaded(true));
  }, [fetchSongs]);

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
    navigate(-1); // Go back in history
  };

  if (songsLoading || !dataLoaded) {
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
    </div>
  );
}