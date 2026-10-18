import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BingoCard from '../components/bingo/BingoCard.jsx';

const card = [
  [1, 12, 5, 22, 9],
  [17, 2, 24, 7, 14],
  [20, 10, 3, 25, 6],
  [15, 19, 4, 11, 23],
  [8, 21, 13, 18, 16],
];

describe('BingoCard', () => {
  it('renders a private shuffled 1–25 board without a free space', () => {
    render(<BingoCard card={card} />);
    expect(screen.getByRole('region', { name: 'Your private board' })).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { name: /Number 1, not called/i })).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(25);
    expect(screen.queryByText('FREE')).not.toBeInTheDocument();
  });

  it('automatically marks server-confirmed calls and highlights completed lines', () => {
    render(
      <BingoCard
        calledNumbers={[1, 12, 5, 22, 9]}
        card={card}
        completedLines={[{ id: 'row-0', cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] }]}
        lineCount={1}
        targetLines={5}
      />
    );
    expect(screen.getByRole('gridcell', { name: /Number 1, called, in a completed line/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Lines 1/5')).toBeInTheDocument();
  });
});
