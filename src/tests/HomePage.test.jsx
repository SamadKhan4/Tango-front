import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  game: null,
}));

vi.mock('../hooks/useGame.js', () => ({ useGame: () => fixture.game }));

import HomePage from '../pages/HomePage.jsx';

function gameFixture(overrides = {}) {
  return {
    connection: 'connected',
    createRoom: vi.fn().mockResolvedValue({ roomCode: 'ABC234' }),
    joinRoom: vi.fn().mockResolvedValue({ roomCode: 'ABC234' }),
    isActionPending: vi.fn().mockReturnValue(false),
    session: null,
    retryConnection: vi.fn(),
    error: null,
    clearError: vi.fn(),
    ...overrides,
  };
}

describe('HomePage', () => {
  beforeEach(() => { fixture.game = gameFixture(); });

  it('shows an accessible name validation message', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Create room' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a display name.');
    expect(fixture.game.createRoom).not.toHaveBeenCalled();
  });

  it('submits a validated room create request', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    await user.type(screen.getByLabelText('Display name'), 'Riya');
    await user.click(screen.getByRole('button', { name: 'Create room' }));
    await waitFor(() => expect(fixture.game.createRoom).toHaveBeenCalledWith('Riya'));
  });
});
