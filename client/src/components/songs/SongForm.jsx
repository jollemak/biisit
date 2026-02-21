import { useState, useEffect } from 'react';

export default function SongForm({
  initialData = { title: '', lyrics: '' },
  onSubmit,
  onCancel,
  loading,
  error
}) {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.lyrics.trim()) {
      return;
    }
    onSubmit(formData);
  };

  const handleCancel = () => {
    setFormData(initialData);
    onCancel();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {initialData.title ? 'Edit Song' : 'Add New Song'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Song Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter song title..."
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Lyrics</label>
          <textarea
            value={formData.lyrics}
            onChange={(e) => setFormData({...formData, lyrics: e.target.value})}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-64 resize-none"
            placeholder="Enter song lyrics..."
            disabled={loading}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !formData.title.trim() || !formData.lyrics.trim()}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Saving...' : 'Save Song'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}