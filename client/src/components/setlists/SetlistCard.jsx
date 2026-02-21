import { useNavigate } from 'react-router-dom';

export default function SetlistCard({ setlist, onRename, onDelete }) {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/setlists/${setlist.id}`);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    onRename(setlist);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(setlist.id);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{setlist.name}</h3>
          <p className="text-gray-400 text-sm mt-1">
            {setlist.song_count} song{setlist.song_count !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleView}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            View
          </button>
          <button
            onClick={handleRename}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Rename
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}