import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GameControls from '../components/bingo/GameControls.jsx';

describe('GameControls', () => {
  it('only enables remaining numbers for the active player', () => {
    const onCall = vi.fn();
    render(<GameControls calledNumbers={[2]} currentTurnName="Asha" isCurrentTurn onCall={onCall} status="IN_PROGRESS" />);

    const firstCall = screen.getByRole('button', { name: 'Call number 1' });
    expect(firstCall).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Number 2 already called' })).toBeDisabled();

    fireEvent.click(firstCall);
    expect(onCall).toHaveBeenCalledWith(1);
  });

  it('locks the number picker when another player has the turn', () => {
    render(<GameControls currentTurnName="Asha" isCurrentTurn={false} onCall={vi.fn()} status="IN_PROGRESS" />);

    expect(screen.getByText('Waiting for Asha to call a number.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Call number 1' })).toBeDisabled();
  });
});
