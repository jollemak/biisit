import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableSongItem({ song, onView, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-800 p-4 rounded-lg flex items-center gap-4"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-200"
      >
        ☰
      </div>
      <div className="flex-1">
        <h3 
          className="text-lg font-semibold cursor-pointer hover:text-blue-400 transition-colors" 
          onClick={() => onView(song)}
        >
          {song.title}
        </h3>
        <p className="text-gray-400 text-sm">
          {song.lyrics.substring(0, 100)}...
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onView(song)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm"
        >
          View
        </button>
        <button
          onClick={() => onRemove(song.id)}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors text-sm"
        >
          Remove
        </button>
      </div>
    </div>
  );
}