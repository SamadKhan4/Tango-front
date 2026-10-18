import { useContext } from 'react';
import { GameContext } from '../context/GameContext.jsx';

export function useGame() {
  const game = useContext(GameContext);
  if (!game) throw new Error('useGame must be used inside GameProvider.');
  return game;
}
