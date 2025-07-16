"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type Machine = {
  id: string;
  publicName: string;
  cpu: string;
  gpu: string;
  ram: string;
  hourlyRate: number;
  status: string;
  moderationStatus: string;
  games: { id: string; title: string }[];
};

export default function ServersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState('AVAILABLE');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);
  const gameId = searchParams.get('game') || '';

  // Демо-данные для витрины
  const demoMachines: Machine[] = useMemo(() => [
    { id: 'demo1', publicName: 'RTX 4090 #1', cpu: 'Intel Core i9-12900K', gpu: 'NVIDIA GeForce RTX 4090', ram: '64GB DDR5', hourlyRate: 100, status: 'AVAILABLE', moderationStatus: 'APPROVED', games: [{ id: 'g1', title: 'Cyberpunk 2077' }, { id: 'g2', title: 'Elden Ring' }] },
    { id: 'demo2', publicName: 'RTX 3080 #2', cpu: 'AMD Ryzen 9 5900X', gpu: 'NVIDIA GeForce RTX 3080', ram: '32GB DDR4', hourlyRate: 75, status: 'AVAILABLE', moderationStatus: 'APPROVED', games: [{ id: 'g3', title: 'Red Dead Redemption 2' }, { id: 'g4', title: 'God of War' }] },
    { id: 'demo3', publicName: 'RX 6800 XT #3', cpu: 'Intel Core i7-11700K', gpu: 'AMD Radeon RX 6800 XT', ram: '16GB DDR4', hourlyRate: 60, status: 'AVAILABLE', moderationStatus: 'APPROVED', games: [{ id: 'g5', title: 'Forza Horizon 5' }, { id: 'g6', title: 'Microsoft Flight Simulator' }] },
    { id: 'demo4', publicName: 'GTX 1660 Super #4', cpu: 'Intel Core i5-10400F', gpu: 'NVIDIA GeForce GTX 1660 Super', ram: '16GB DDR4', hourlyRate: 40, status: 'AVAILABLE', moderationStatus: 'APPROVED', games: [{ id: 'g7', title: 'CS:GO' }, { id: 'g8', title: 'Dota 2' }] },
  ], []);




  useEffect(() => {
    setLoading(true);
    const params = [];
    if (price > 0) params.push(`maxPrice=${price}`);
    if (status && status !== 'any') params.push(`status=${status}`);
    fetch(`/api/servers${params.length ? '?' + params.join('&') : ''}`)
      .then(res => res.json())
      .then(data => {
        console.log('API /api/servers response:', data);
        // Если серверов нет — показываем демо
        if (!data || data.length === 0) {
          setMachines(demoMachines);
        } else {
          setMachines(data);
        }
        setLoading(false);
      }).catch((e) => {
        console.error('Ошибка загрузки серверов:', e);
        setMachines(demoMachines);
        setLoading(false);
      });
  }, [price, status, demoMachines]);

  const handleStartSession = async (machineId: string) => {
    // Для демо-машин — просто alert
    if (machineId.startsWith('demo')) {
      alert('Демо: запуск сессии на сервере ' + machineId);
      setStarting(null);
      return;
    }
    setStarting(machineId);
    const res = await fetch('/api/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ machineId }),
    });
    if (res.ok) {
      router.push('/dashboard');
    } else {
      alert('Ошибка запуска сессии: ' + (await res.json()).error);
    }
    setStarting(null);
  };


  const filtered = machines.filter(machine =>
    (gameId === '' || machine.games.some(g => g.id === gameId)) &&
    (price === 0 || machine.hourlyRate <= price) &&
    (status === '' || machine.status === status)
  );

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Каталог серверов</h1>
      <div className="flex gap-4 mb-6">
        <input
          type="number"
          className="bg-zinc-900 px-3 py-2 rounded text-white"
          placeholder="Цена до (₸/час)"
          min={0}
          value={price || ''}
          onChange={e => setPrice(Number(e.target.value))}
        />
        <select
          className="bg-zinc-900 px-3 py-2 rounded text-white"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="any">Любой статус</option>
          <option value="AVAILABLE">Доступен</option>
          <option value="BUSY">Занят</option>
          <option value="MAINTENANCE">На обслуживании</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-zinc-400 py-16">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-zinc-400 py-16">
          <div className="text-4xl mb-2">🖥️</div>
          Нет подходящих серверов
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(machine => (
            <div key={machine.id} className="bg-zinc-900 rounded-xl shadow p-5 flex flex-col gap-3 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-lg">{machine.publicName}</div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${machine.status === 'AVAILABLE' ? 'bg-green-700 text-green-100' : machine.status === 'BUSY' ? 'bg-yellow-700 text-yellow-100' : 'bg-zinc-700 text-zinc-300'}`}>{
                  machine.status === 'AVAILABLE' ? 'Доступен' : machine.status === 'BUSY' ? 'Занят' : 'Обслуживание'
                }</span>
              </div>
              <div className="flex flex-col gap-1 text-sm text-zinc-300">
                <div><b>CPU:</b> {machine.cpu}</div>
                <div><b>GPU:</b> {machine.gpu}</div>
                <div><b>RAM:</b> {machine.ram}</div>
                <div><b>Цена:</b> {machine.hourlyRate / 100}₸/час</div>
                {machine.games && machine.games.length > 0 && (
                  <div><b>Игры:</b> {machine.games.map(g => g.title).join(', ')}</div>
                )}
              </div>
              <button
                className={`mt-3 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition disabled:opacity-60 disabled:cursor-not-allowed`}
                disabled={machine.status !== 'AVAILABLE' || starting === machine.id}
                onClick={() => handleStartSession(machine.id)}
              >
                {starting === machine.id ? 'Запуск...' : 'Запустить'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
