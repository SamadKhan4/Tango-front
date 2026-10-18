import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ConnectionStatus from '../components/common/ConnectionStatus.jsx';

describe('ConnectionStatus', () => {
  it('shows connection state and supports a manual retry', () => {
    const retry = vi.fn();
    render(<ConnectionStatus onRetry={retry} status="error" />);
    expect(screen.getByText(/game server is unavailable/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
