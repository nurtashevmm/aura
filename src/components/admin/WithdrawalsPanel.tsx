import React, { useEffect, useState } from 'react';

export default function WithdrawalsPanel() {
  type Transaction = {
  id: string;
  type: string;
  amount: number;
  status?: string | null;
  createdAt: string;
  userId?: string;
  
};
const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWithdrawals = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/withdrawals');
    const data = await res.json();
    setWithdrawals(data);
    setLoading(false);
  };

  useEffect(() => { fetchWithdrawals(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/withdrawals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchWithdrawals();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Заявки на вывод средств</h2>
      {loading ? <div>Загрузка...</div> : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-zinc-800 text-blue-300">
              <th className="px-2 py-1">ID</th>
              <th className="px-2 py-1">Пользователь</th>
              <th className="px-2 py-1">Сумма</th>
              <th className="px-2 py-1">Статус</th>
              <th className="px-2 py-1">Дата</th>
              <th className="px-2 py-1">Действия</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map(w => (
              <tr key={w.id}>
                <td className="px-2 py-1">{w.id}</td>
                <td className="px-2 py-1">{w.userId}</td>
                <td className="px-2 py-1">{Math.abs(w.amount)}</td>
                <td className="px-2 py-1">{w.status}</td>
                <td className="px-2 py-1">{new Date(w.createdAt).toLocaleString()}</td>
                <td className="px-2 py-1">
                  {w.status === 'pending' && (
                    <>
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded mr-2"
                        onClick={() => updateStatus(w.id, 'done')}
                      >Одобрить</button>
                      <button
                        className="px-2 py-1 bg-red-600 text-white rounded"
                        onClick={() => updateStatus(w.id, 'rejected')}
                      >Отклонить</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
