import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useSongs from '/src/hooks/useSongs.js';
import useSetlistSongs from '/src/hooks/useSetlistSongs.js';
import Layout from '/src/components/shared/Layout';
import LoadingSpinner from '/src/components/shared/LoadingSpinner';
import ErrorMessage from '/src/components/shared/ErrorMessage';
import SuccessMessage from '/src/components/shared/SuccessMessage';

export default function SongViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { songs, loading: songsLoading, fetchSongs } = useSongs();
  const setlistId = searchParams.get('setlist');
  const { setlistSongs, loading: setlistLoading, fetchSetlistSongs } = useSetlistSongs(setlistId ? parseInt(setlistId) : null);

  const [song, setSong] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Formatting state
  const [textAlign, setTextAlign] = useState('left');
  const [fontSize, setFontSize] = useState('M');
  const [successMessage, setSuccessMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);

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
      setSong(foundSong);
      // Load formatting settings
      setTextAlign(foundSong.text_align || 'left');
      setFontSize(foundSong.font_size || 'M');
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

  const handleFormattingChange = (newTextAlign, newFontSize) => {
    // Update local state only - don't save to database yet
    setTextAlign(newTextAlign);
    setFontSize(newFontSize);
  };

  const handleSaveFormatting = async () => {
    try {
      const response = await fetch(`/api/songs/${song.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: song.title,
          lyrics: song.lyrics,
          text_align: textAlign,
          font_size: fontSize
        })
      });

      if (!response.ok) throw new Error('Failed to save formatting');

      setSuccessMessage('Formatting saved');
      setShowMenu(false); // Close menu after saving
    } catch (error) {
      console.error('Error saving formatting:', error);
      // Could add error state here if needed
    }
  };

  // Close menu when clicking outside
  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle arrow keys when not typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNext();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext]);

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
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="fixed top-6 left-6 right-6 z-50 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={handleBack}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              ← Back
            </button>
            
            <h1 className="text-3xl font-bold">{song.title}</h1>
            
            {/* Hamburger Menu Button */}
            <button
              onClick={handleMenuToggle}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              title="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
          
          {/* Navigation Buttons - Fixed position below title */}
          <div className="flex justify-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={navigationSongs.length <= 1}
              className="w-10 h-10 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 disabled:bg-opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 active:scale-95"
              aria-label="Previous song"
              title="Previous song (←)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>
            
            <button
              onClick={handleNext}
              disabled={navigationSongs.length <= 1}
              className="w-10 h-10 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 disabled:bg-opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 active:scale-95"
              aria-label="Next song"
              title="Next song (→)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Add padding to account for fixed header */}
        <div className="pt-23">
          {/* Dropdown Menu */}
        {showMenu && (
          <div className="menu-container mb-6 p-4 bg-gray-800 rounded-lg shadow-lg">
            {/* Formatting Controls */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Align:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleFormattingChange('left', fontSize)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      textAlign === 'left' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                    title="Left align"
                  >
                    ≡
                  </button>
                  <button
                    onClick={() => handleFormattingChange('center', fontSize)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      textAlign === 'center' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                    title="Center align"
                  >
                    ≡
                  </button>
                  <button
                    onClick={() => handleFormattingChange('right', fontSize)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      textAlign === 'right' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                    title="Right align"
                  >
                    ≡
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Size:</span>
                <div className="flex gap-1">
                  {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                    <button
                      key={size}
                      onClick={() => handleFormattingChange(textAlign, size)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        fontSize === size 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                      title={`Font size ${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveFormatting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                title="Save formatting settings"
              >
                Save
              </button>
            </div>

            {/* Edit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                Edit Song
              </button>
            </div>
          </div>
        )}
        
        <div className="text-center">
          <div 
            className={`leading-relaxed whitespace-pre-line ${
              textAlign === 'center' ? 'text-center' :
              textAlign === 'right' ? 'text-right' : 'text-left'
            } ${
              fontSize === 'XS' ? 'text-xl' :
              fontSize === 'S' ? 'text-2xl' :
              fontSize === 'M' ? 'text-3xl' :
              fontSize === 'L' ? 'text-4xl' :
              fontSize === 'XL' ? 'text-5xl' : 'text-3xl'
            }`}
          >
            {song.lyrics}
          </div>
        </div>
        </div>
      </div>

      {/* Success message for formatting changes */}
      <SuccessMessage
        message={successMessage}
        onClose={() => setSuccessMessage('')}
      />
    </div>
  );
}