import { useEffect } from 'react';

export default function SongNavigation({ onPrevious, onNext, disabled = false }) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle arrow keys when not typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          onPrevious?.();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNext?.();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onPrevious, onNext]);

  return (
    <>
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={disabled}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 disabled:bg-opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 active:scale-95"
        aria-label="Previous song"
        title="Previous song (←)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={disabled}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 disabled:bg-opacity-50 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 active:scale-95"
        aria-label="Next song"
        title="Next song (→)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9,18 15,12 9,6"></polyline>
        </svg>
      </button>
    </>
  );
}