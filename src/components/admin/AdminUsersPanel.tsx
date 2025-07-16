import React, { useEffect, useState } from 'react';

export type User = {
  id: string;
  name?: string;
  email?: string;
  role: 'PLAYER' | 'MERCHANT' | 'ADMIN';
  balance: number;
};

export default function AdminUsersPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [role, setRole] = useState('PLAYER');

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  const handleBalance = async (id: string) => {
    await fetch(`/api/admin/users/${id}/balance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) }),
    });
    setEditId(null);
    setLoading(true);
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  };

  const handleRole = async (id: string) => {
    await fetch(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    setEditId(null);
    setLoading(true);
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  };

  if (loading) return <div>Загрузка пользователей...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Пользователи</h2>
      <table className="w-full text-left mb-4">
        <thead>
          <tr className="bg-zinc-800">
            <th className="p-2">ID</th>
            <th className="p-2">Имя</th>
            <th className="p-2">Email</th>
            <th className="p-2">Роль</th>
            <th className="p-2">Баланс</th>
            <th className="p-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b border-zinc-700">
              <td className="p-2 font-mono text-xs">{user.id}</td>
              <td className="p-2">{user.name || '-'}</td>
              <td className="p-2">{user.email || '-'}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2">{user.balance} ₸</td>
              <td className="p-2">
                {editId === user.id ? (
                  <div className="flex flex-col gap-1">
                    <input
                      type="number"
                      placeholder="Сумма"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="p-1 rounded bg-zinc-800 text-white mb-1"
                    />
                    <button className="px-2 py-1 bg-blue-600 text-white rounded mb-1" onClick={() => handleBalance(user.id)}>
                      Пополнить
                    </button>
                    <select value={role} onChange={e => setRole(e.target.value)} className="p-1 rounded bg-zinc-800 text-white mb-1">
                      <option value="PLAYER">PLAYER</option>
                      <option value="MERCHANT">MERCHANT</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => handleRole(user.id)}>
                      Сменить роль
                    </button>
                    <button className="px-2 py-1 bg-zinc-700 text-white rounded" onClick={() => setEditId(null)}>
                      Отмена
                    </button>
                  </div>
                ) : (
                  <button className="px-2 py-1 bg-zinc-700 text-white rounded" onClick={() => { setEditId(user.id); setRole(user.role); }}>
                    Управлять
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
