import { getPeers } from '@/lib/api';

export default async function Home() {
  const peers = await getPeers();

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Aura P2P Status</h1>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-2">Connected Peers</h2>
        
        {peers.length > 0 ? (
          <ul className="space-y-2">
            {peers.map(peer => (
              <li key={peer.id} className="flex justify-between items-center p-2 border rounded">
                <span>{peer.id}</span>
                <span className="text-sm text-gray-500">{peer.address}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No peers connected</p>
        )}
      </div>
    </main>
  );
}
