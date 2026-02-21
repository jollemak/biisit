import SetlistCard from './SetlistCard';

export default function SetlistList({ setlists, onRename, onDelete }) {
  if (setlists.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No setlists yet. Create your first setlist!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {setlists.map(setlist => (
        <SetlistCard
          key={setlist.id}
          setlist={setlist}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}