import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LineProgress from '../components/bingo/LineProgress.jsx';

describe('LineProgress', () => {
  it('shows only the current player completed line details', () => {
    render(<LineProgress completedLines={[{ id: 'row-0' }, { id: 'diagonal-main' }]} lineCount={2} targetLines={5} />);

    expect(screen.getByRole('progressbar', { name: '2 of 5 lines complete' })).toHaveAttribute('aria-valuenow', '2');
    expect(screen.getByText('Row 1')).toBeInTheDocument();
    expect(screen.getByText('Main diagonal')).toBeInTheDocument();
  });
});
