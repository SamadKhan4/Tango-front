import { Home, MapPinOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return <AppShell><EmptyState actionIcon={<Home className="size-4" aria-hidden="true" />} actionLabel="Return home" description="This Tango page does not exist, or the shared link is incomplete." icon={MapPinOff} onAction={() => navigate('/')} title="Room not found" /></AppShell>;
}
