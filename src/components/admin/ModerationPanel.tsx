import React, { useState, useEffect } from 'react';

export type Machine = {
  id: string;
  publicName: string;
  cpu: string;
  gpu: string;
  ram: string;
  hourlyRate: number;
  status: string;
  moderationStatus: string;
  moderationComment?: string;
  screenshotUrl?: string;
  ownerId: string;
};

export default function ModerationPanel() {
  const [pending, setPending] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetch('/api/machines?moderationStatus=PENDING_MODERATION')
      .then(res => res.json())
      .then(data => {
        setPending(data);
        setLoading(false);
      });
  }, []);

  const moderate = async (id: string, status: 'AVAILABLE' | 'REJECTED') => {
    setModeratingId(id);
    await fetch(`/api/machines/${id}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, comment }),
    });
    setPending(pending.filter(m => m.id !== id));
    setModeratingId(null);
    setComment('');
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">На модерации</h2>
      {pending.length === 0 && <div>Нет серверов на модерации.</div>}
      {pending.map(machine => (
        <div key={machine.id} className="bg-zinc-900 rounded p-4 mb-4">
          <div className="font-bold text-lg text-white mb-1">{machine.publicName}</div>
          <div className="text-sm text-zinc-400 mb-1">CPU: {machine.cpu} | GPU: {machine.gpu} | RAM: {machine.ram}</div>
          <div className="text-sm text-zinc-400 mb-1">Цена: {machine.hourlyRate} ₸/час</div>
          <textarea
            className="w-full p-2 rounded bg-zinc-800 text-white mb-2"
            placeholder="Комментарий (только при отклонении)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={moderatingId === machine.id}
          />
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => moderate(machine.id, 'AVAILABLE')}
              disabled={moderatingId === machine.id}
            >
              Одобрить
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded"
              onClick={() => moderate(machine.id, 'REJECTED')}
              disabled={moderatingId === machine.id}
            >
              Отклонить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
