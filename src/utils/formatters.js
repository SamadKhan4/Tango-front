export function bingoColumn(number) {
  if (number <= 15) return 'B';
  if (number <= 30) return 'I';
  if (number <= 45) return 'N';
  if (number <= 60) return 'G';
  return 'O';
}

export function formatBall(number) {
  return number ? `${bingoColumn(number)}-${number}` : '—';
}

export function roomLink(roomCode) {
  if (typeof window === 'undefined') return `/room/${roomCode}`;
  return `${window.location.origin}/room/${roomCode}`;
}

export function playerLabel(player, currentPlayerId) {
  if (!player) return 'Unknown player';
  return player.id === currentPlayerId ? `${player.name} (you)` : player.name;
}
