import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { useGame } from '../hooks/useGame.js';
import HomePage from '../pages/HomePage.jsx';
import LobbyPage from '../pages/LobbyPage.jsx';
import GamePage from '../pages/GamePage.jsx';
import ResultsPage from '../pages/ResultsPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

function RoomPage() {
  const { roomCode } = useParams();
  const { room, session } = useGame();
  const normalized = roomCode?.toUpperCase();
  if (!session || session.roomCode !== normalized) return <Navigate to={`/?room=${normalized || ''}`} replace />;
  if (!room) return <LobbyPage restoring />;
  if (room.status === 'IN_PROGRESS') return <GamePage />;
  if (room.status === 'COMPLETED') return <ResultsPage />;
  return <LobbyPage />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/room/:roomCode" element={<RoomPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
