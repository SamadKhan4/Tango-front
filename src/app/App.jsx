import { BrowserRouter } from 'react-router-dom';
import { GameProvider } from '../context/GameContext.jsx';
import { AppRouter } from './router.jsx';

export function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <AppRouter />
      </GameProvider>
    </BrowserRouter>
  );
}
