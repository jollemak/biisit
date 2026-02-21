import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import SortableSongItem from './SortableSongItem';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function SetlistSongList({
  songs,
  onRemove,
  onReorder,
  loading
}) {
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = songs.findIndex(song => song.id === active.id);
      const newIndex = songs.findIndex(song => song.id === over.id);

      const newSongs = arrayMove(songs, oldIndex, newIndex);
      await onReorder(newSongs);
    }
  };

  const handleView = (song) => {
    navigate(`/songs/${song.id}`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading songs..." />;
  }

  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No songs in this setlist yet. Add songs from the All Songs tab.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={songs.map(song => song.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {songs.map(song => (
            <SortableSongItem
              key={song.id}
              song={song}
              onView={handleView}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}