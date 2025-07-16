export interface Session {
  id: string;
  machineName: string;
  game: string;
  startedAt: string;
  duration: number;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  ipAddress: string;
}
