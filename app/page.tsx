'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { ComputeResource, User } from "@prisma/client";

// ... (остальной код компонента, который я давал ранее, вставляем сюда)
// Я вставлю его полностью, чтобы не было путаницы

type ResourceWithOwner = ComputeResource & {
  owner: { email: string; } | null;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<ResourceWithOwner[]>([]);
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  const [formState, setFormState] = useState({
    name: '', type: 'PC', tier: 'Стандарт', ipAddress: '', hourlyRate: '',
    cpu: '', gpu: '', ram: '', os: 'Windows 11'
  });

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      axios.get('/api/admin/users'),
      axios.get('/api/admin/resources')
    ]).then(([usersResponse, resourcesResponse]) => {
      setUsers(usersResponse.data);
      setResources(resourcesResponse.data);
    }).catch(error => {
      console.error("Ошибка загрузки данных", error);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/resources', formState);
      alert('Ресурс успешно добавлен!');
      setFormState({ name: '', type: 'PC', tier: 'Стандарт', ipAddress: '', hourlyRate: '', cpu: '', gpu: '', ram: '', os: 'Windows 11' });
      fetchData();
    } catch (error) {
      alert('Ошибка при добавлении ресурса.');
      console.error(error);
    }
  };
  
  const handleTopUp = async (userId: string) => {
    const amount = parseFloat(amounts[userId]);
    if (isNaN(amount) || amount <= 0) {
      alert("Пожалуйста, введите корректную сумму."); return;
    }
    try {
      await axios.post('/api/admin/update-balance', { userId, amount });
      alert('Баланс успешно пополнен!');
      fetchData();
      setAmounts(prev => ({ ...prev, [userId]: '' }));
    } catch (error) {
      alert('Ошибка при пополнении баланса.'); console.error(error);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
        <p className="text-brand-text">Загрузка...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Панель <span className="text-brand-amber">Администратора</span></h1>
      
      <div className="bg-brand-surface rounded-lg shadow-lg p-6 mb-8 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Добавить новый ресурс</h2>
        <form onSubmit={handleAddResource} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="name" value={formState.name} onChange={handleFormChange} placeholder="Название (ПК #1)" className="px-3 py-2 bg-brand-bg rounded-md border border-white/10 focus:ring-2 focus:ring-brand-amber focus:outline-none" required />
          <input name="gpu" value={formState.gpu} onChange={handleFormChange} placeholder="Видеокарта (RTX 4090)" className="px-3 py-2 bg-brand-bg rounded-md border border-white/10 focus:ring-2 focus:ring-brand-amber focus:outline-none" />
          <input name="cpu" value={formState.cpu} onChange={handleFormChange} placeholder="Процессор (i9-13900K)" className="px-3 py-2 bg-brand-bg rounded-md border border-white/10 focus:ring-2 focus:ring-brand-amber focus:outline-none" />
          <input name="ram" value={formState.ram} onChange={handleFormChange} placeholder="ОЗУ (32GB DDR5)" className="px-3 py-2 bg-brand-bg rounded-md border border-white/10 focus:ring-2 focus:ring-brand-amber focus:outline-none" />
          <input name="ipAddress" value={formState.ipAddress} onChange={handleFormChange} placeholder="IP адрес (Tailscale)" className="px-3 py-2 bg-brand-bg rounded-md border border-white/10 focus:ring-2 focus:ring-brand-amber focus:outline-none" required />
          <input name="hourlyRate" value={formState.hourlyRate} onChange={handleFormChange} type="number" placeholder="Цена в час (тг)" className="px-3 py-2 bg-brand-bg rounded-md border border-white/10 focus:ring-2 focus:ring-brand-amber focus:outline-none" required />
          <select name="type" value={formState.type} onChange={handleFormChange} className="px-3 py-2 bg-brand-bg rounded-md border border-white/10 focus:ring-2 focus:ring-brand-amber focus:outline-none">
            <option value="PC">ПК</option>
            <option value="CONSOLE">Консоль</option>
          </select>
          <select name="tier" value={formState.tier} onChange={handleFormChange} className="px-3 py-2 bg-brand-bg rounded-md border border-white/10 focus:ring-2 focus:ring-brand-amber focus:outline-none">
            <option>Стандарт</option><option>Ультра</option><option>4K</option>
          </select>
          <button type="submit" className="bg-brand-amber text-brand-bg font-bold px-4 py-2 rounded-md hover:bg-brand-amber/90 transition col-span-full">Добавить ресурс</button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-surface rounded-lg shadow-lg p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Игровые ресурсы</h2>
          <div className="space-y-3">
            {resources.length > 0 ? resources.map(res => (
              <div key={res.id} className="grid grid-cols-3 gap-4 items-center bg-brand-bg p-3 rounded-md">
                <div className="col-span-2">
                  <p className="font-semibold text-white">{res.name}</p>
                  <p className="text-xs text-brand-text">{res.gpu || 'N/A'}</p>
                </div>
                <p className="font-semibold text-brand-amber justify-self-end">{res.hourlyRate.toFixed(2)} ₸/час</p>
              </div>
            )) : <p className="text-brand-text">Добавленных ресурсов пока нет.</p>}
          </div>
        </div>

        <div className="bg-brand-surface rounded-lg shadow-lg p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Пользователи</h2>
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="bg-brand-bg p-3 rounded-md">
                <p className="font-semibold text-white">{user.email}</p>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-brand-text">Баланс: <span className="font-bold text-green-400">{user.balance.toFixed(2)} ₸</span></p>
                    <div className="flex items-center space-x-2">
                      <input type="number" placeholder="Сумма"
                        className="px-2 py-1 bg-gray-700 border border-white/10 rounded-md w-24 text-right text-white"
                        value={amounts[user.id] || ''}
                        onChange={(e) => setAmounts(prev => ({ ...prev, [user.id]: e.target.value }))}
                      />
                      <button onClick={() => handleTopUp(user.id)}
                        className="bg-green-600 px-3 py-1 rounded-md hover:bg-green-700 text-sm font-bold text-white transition">
                        Пополнить
                      </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}