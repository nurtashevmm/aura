'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { ComputeResource, User } from "@prisma/client";

// Расширяем тип, чтобы включить email владельца
type ResourceWithOwner = ComputeResource & {
  owner: {
    email: string;
  } | null;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<ResourceWithOwner[]>([]);
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Состояния для полей формы
  const [formState, setFormState] = useState({
    name: '', type: 'PC', tier: 'Стандарт', ipAddress: '', hourlyRate: '',
    cpu: '', gpu: '', ram: '', os: 'Windows 11'
  });

  // Функция для загрузки всех данных с сервера
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

  // Загружаем данные при первой загрузке страницы
  useEffect(() => {
    fetchData();
  }, []);
  
  // Обработчик для всех полей формы
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // Функция для отправки формы
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/resources', formState);
      alert('Ресурс успешно добавлен!');
      // Очищаем форму
      setFormState({ name: '', type: 'PC', tier: 'Стандарт', ipAddress: '', hourlyRate: '', cpu: '', gpu: '', ram: '', os: 'Windows 11' });
      fetchData(); // Перезагружаем список
    } catch (error) {
      alert('Ошибка при добавлении ресурса.');
      console.error(error);
    }
  };

  // Функция пополнения баланса
  const handleTopUp = async (userId: string) => {
    const amount = parseFloat(amounts[userId]);
    if (isNaN(amount) || amount <= 0) {
      alert("Пожалуйста, введите корректную сумму."); return;
    }
    try {
      await axios.post('/api/admin/update-balance', { userId, amount });
      alert('Баланс успешно пополнен!');
      fetchData(); // Перезагружаем данные
      setAmounts(prev => ({ ...prev, [userId]: '' }));
    } catch (error) {
      alert('Ошибка при пополнении баланса.'); console.error(error);
    }
  };

  if (isLoading) return <p className="text-white text-center mt-10">Загрузка...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Панель Администратора</h1>
      
      {/* Форма добавления/редактирования ресурса */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Добавить новый ресурс</h2>
        <form onSubmit={handleAddResource} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="name" value={formState.name} onChange={handleFormChange} placeholder="Название (ПК #1)" className="px-3 py-2 bg-gray-700 rounded-md text-white" required />
          <input name="gpu" value={formState.gpu} onChange={handleFormChange} placeholder="Видеокарта (RTX 4090)" className="px-3 py-2 bg-gray-700 rounded-md text-white" />
          <input name="cpu" value={formState.cpu} onChange={handleFormChange} placeholder="Процессор (i9-13900K)" className="px-3 py-2 bg-gray-700 rounded-md text-white" />
          <input name="ram" value={formState.ram} onChange={handleFormChange} placeholder="ОЗУ (32GB DDR5)" className="px-3 py-2 bg-gray-700 rounded-md text-white" />
          <input name="ipAddress" value={formState.ipAddress} onChange={handleFormChange} placeholder="IP адрес (Tailscale)" className="px-3 py-2 bg-gray-700 rounded-md text-white" required />
          <input name="hourlyRate" value={formState.hourlyRate} onChange={handleFormChange} type="number" placeholder="Цена в час (тг)" className="px-3 py-2 bg-gray-700 rounded-md text-white" required />
          <select name="type" value={formState.type} onChange={handleFormChange} className="px-3 py-2 bg-gray-700 rounded-md text-white">
            <option value="PC">ПК</option>
            <option value="CONSOLE">Консоль</option>
          </select>
          <select name="tier" value={formState.tier} onChange={handleFormChange} className="px-3 py-2 bg-gray-700 rounded-md text-white">
            <option>Стандарт</option><option>Ультра</option><option>4K</option>
          </select>
          <button type="submit" className="bg-cyan-600 px-4 py-2 rounded-md hover:bg-cyan-700 transition col-span-full">Добавить ресурс</button>
        </form>
      </div>

      {/* Список игровых ресурсов */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Игровые ресурсы</h2>
        <div className="space-y-2">
          {resources.length > 0 ? (
            resources.map(res => (
              <div key={res.id} className="grid grid-cols-5 gap-4 items-center bg-gray-700 p-3 rounded-lg">
                <div className="col-span-2">
                    <p className="font-semibold">{res.name}</p>
                    <p className="text-xs text-gray-400">{res.gpu || 'N/A'}</p>
                </div>
                <p className="text-sm text-cyan-400">{res.status}</p>
                <p className="font-semibold">{res.hourlyRate.toFixed(2)} ₸/час</p>
                <div className="text-right">
                  {/* Кнопки Редактировать/Удалить будут здесь */}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">Добавленных ресурсов пока нет.</p>
          )}
        </div>
      </div>
      
      {/* Список пользователей */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Пользователи</h2>
        <div className="space-y-4">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
              <div>
                <p className="font-semibold">{user.email}</p>
                <p className="text-sm text-gray-400">Роль: {user.role} | Баланс: <span className="text-green-400 font-bold">{user.balance.toFixed(2)} ₸</span></p>
              </div>
              <div className="flex items-center space-x-2">
                <input type="number" placeholder="Сумма (тг)"
                  className="px-2 py-1 bg-gray-600 border border-gray-500 rounded-md w-28 text-right text-white"
                  value={amounts[user.id] || ''}
                  onChange={(e) => setAmounts(prev => ({...prev, [user.id]: e.target.value}))}
                />
                <button onClick={() => handleTopUp(user.id)}
                  className="bg-green-600 px-4 py-1 rounded-md hover:bg-green-700 transition"
                >
                  Пополнить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}