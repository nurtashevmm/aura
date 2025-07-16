const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const getPeers = async (): Promise<PeerInfo[]> => {
  const res = await fetch(`${API_BASE_URL}/peers`);
  return await res.json();
};

export const sendMessage = async (peerId: string, message: string) => {
  await fetch(`${API_BASE_URL}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ peerId, message })
  });
};

type PeerInfo = {
  id: string;
  address: string;
};
