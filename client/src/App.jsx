import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SongsPage from './pages/SongsPage';
import SongFormPage from './pages/SongFormPage';
import SongViewPage from './pages/SongViewPage';
import SetlistsPage from './pages/SetlistsPage';
import SetlistDetailPage from './pages/SetlistDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SongsPage />} />
        <Route path="/songs/new" element={<SongFormPage />} />
        <Route path="/songs/:id" element={<SongViewPage />} />
        <Route path="/songs/:id/edit" element={<SongFormPage />} />
        <Route path="/setlists" element={<SetlistsPage />} />
        <Route path="/setlists/:id" element={<SetlistDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}