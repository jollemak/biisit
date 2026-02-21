import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSongs from '/src/hooks/useSongs.js';
import Layout from '/src/components/shared/Layout';
import SongForm from '/src/components/songs/SongForm';
import ErrorMessage from '/src/components/shared/ErrorMessage';
import LoadingSpinner from '/src/components/shared/LoadingSpinner';

export default function SongFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { songs, createSong, updateSong, loading, error, fetchSongs } = useSongs();

  const [initialData, setInitialData] = useState({ title: '', lyrics: '' });
  const [isLoading, setIsLoading] = useState(!!id);
  const [dataLoaded, setDataLoaded] = useState(false);

  const isEditing = !!id;

  useEffect(() => {
    fetchSongs().then(() => setDataLoaded(true));
  }, [fetchSongs]);

  useEffect(() => {
    if (!dataLoaded) return; // Wait for data to load

    if (isEditing) {
      const song = songs.find(s => s.id === parseInt(id));
      if (song) {
        setInitialData({ title: song.title, lyrics: song.lyrics }); // eslint-disable-line react-hooks/set-state-in-effect
        setIsLoading(false);
      } else {
        setIsLoading(false);
        // Data is loaded but song not found - now we can redirect
        navigate('/');
      }
    } else {
      setIsLoading(false);
    }
  }, [id, songs, dataLoaded, isEditing, navigate]);

  const handleSubmit = async (formData) => {
    const success = isEditing
      ? await updateSong(parseInt(id), formData)
      : await createSong(formData);

    if (success) {
      navigate('/');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (isLoading || !dataLoaded) {
    return (
      <Layout>
        <LoadingSpinner message="Loading song..." />
      </Layout>
    );
  }

  return (
    <Layout showTabs={false}>
      <ErrorMessage message={error} />

      <SongForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        error={error}
      />
    </Layout>
  );
}