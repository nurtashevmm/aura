import React, { useEffect, useState } from 'react';

export type Machine = {
  id: string;
  publicName: string;
  cpu: string;
  gpu: string;
  ram: string;
  hourlyRate: number;
  status: string;
  moderationStatus: string;
  screenshotUrl?: string;
  tailscaleIp?: string;
  sunshinePin?: string;
};

export default function MachineCatalog() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/machines')
      .then(res => res.json())
      .then(data => {
        setMachines(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Загрузка серверов...</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {machines.map(machine => (
        <div key={machine.id} className="bg-zinc-900 rounded-lg shadow p-4 flex flex-col items-center">
          <div className="font-bold text-lg text-white mb-1">{machine.publicName}</div>
          <div className="text-sm text-zinc-400 mb-1">CPU: {machine.cpu}</div>
          <div className="text-sm text-zinc-400 mb-1">GPU: {machine.gpu}</div>
          <div className="text-sm text-zinc-400 mb-1">RAM: {machine.ram}</div>
          <div className="text-sm text-zinc-400 mb-1">Цена: {machine.hourlyRate} ₸/час</div>
          <div className="text-xs text-zinc-500 mb-1">Статус: {machine.status}</div>
          <div className="text-xs text-zinc-500 mb-1">Модерация: {machine.moderationStatus}</div>
          
        </div>
      ))}
    </div>
  );
}
