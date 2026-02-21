import SongCard from './SongCard';

export default function SongList({
  songs,
  onEdit,
  onDelete,
  setlists,
  onAddToSetlist,
  onCreateSetlist
}) {
  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No songs yet. Add your first song!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {songs.map(song => (
        <SongCard
          key={song.id}
          song={song}
          onEdit={onEdit}
          onDelete={onDelete}
          setlists={setlists}
          onAddToSetlist={onAddToSetlist}
          onCreateSetlist={onCreateSetlist}
        />
      ))}
    </div>
  );
}