import { useNavigate } from 'react-router-dom';
import AddToSetlistDropdown from './AddToSetlistDropdown';

export default function SongCard({
  song,
  onEdit,
  onDelete,
  setlists,
  onAddToSetlist,
  onCreateSetlist
}) {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/songs/${song.id}`);
  };

  return (
    <div className="bg-gray-800 p-1 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3
            className="text-xl font-semibold hover:text-blue-400 ml-2 cursor-pointer transition-colors"
            onClick={handleView}
          >
            {song.title}
          </h3>
          <p className="text-gray-400 text-sm ml-2 mt-2">
            {song.lyrics.substring(0, 100)}...
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <AddToSetlistDropdown
            songId={song.id}
            setlists={setlists}
            onAdd={onAddToSetlist}
            onCreateNew={onCreateSetlist}
          />
          <button
            onClick={() => onEdit(song)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(song.id)}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}