const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const getPeers = async (): Promise<PeerInfo[]> => {
  const res = await fetch(`${API_BASE_URL}/p2p/peers`);
  return await res.json();
};

export const sendMessage = async (peerId: string, message: string) => {
  await fetch(`${API_BASE_URL}/p2p/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ peerId, message })
  });
};

export const getBalance = async (): Promise<number> => {
  const res = await fetch(`${API_BASE_URL}/balance`);
  if (!res.ok) return 0;
  return await res.json();
};

export const topUpBalance = async (amount: number) => {
  await fetch(`${API_BASE_URL}/balance/topup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });
};

export const listPcs = async (): Promise<string[]> => {
  const res = await fetch(`${API_BASE_URL}/pcs`);
  if (!res.ok) return [];
  return await res.json();
};

export const startSession = async (pcId: string) => {
  await fetch(`${API_BASE_URL}/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pc_id: pcId })
  });
};

export const stopSession = async (pcId: string) => {
  await fetch(`${API_BASE_URL}/session/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pc_id: pcId })
  });
};

export const getStatsSummary = async (): Promise<{
  activeSessions: number;
  dailyRevenue: number;
  uptime: number;
  sessionHistory: { date: string; count: number }[];
}> => {
  const res = await fetch(`${API_BASE_URL}/stats/summary`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return await res.json();
};

export const getROIData = async (): Promise<{
  hourlyRate: number;
  averageUsage: number;
}> => {
  const res = await fetch(`${API_BASE_URL}/stats/roi`);
  if (!res.ok) throw new Error('Failed to fetch ROI data');
  return await res.json();
};

export const processPayment = async (amount: number, method: string) => {
  const res = await fetch(`${API_BASE_URL}/billing/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, method })
  });
  return await res.json();
};

export const processKaspiPayment = async (amount: number, phone: string) => {
  const res = await fetch(`${API_BASE_URL}/billing/kaspi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, phone })
  });
  return await res.json();
};

type StatsSummary = {
  sessions_total: number;
  active_sessions: number;
};

type PeerInfo = {
  id: string;
  address: string;
};
