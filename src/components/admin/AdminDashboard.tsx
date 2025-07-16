'use client';

import { useState } from 'react';
import { Machine, MachineStatus } from '@prisma/client';


const PasswordProtect = ({ onAuth }: { onAuth: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be a proper auth check
    if (password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'password')) {
      onAuth();
    } else {
      setError('Неверный пароль');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Доступ к панели</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введите пароль"
          className="w-full p-3 bg-gray-900 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFB648]"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button type="submit" className="w-full mt-6 p-3 font-semibold text-black bg-[#FFB648] rounded-md hover:bg-amber-500 transition-colors">
          Войти
        </button>
      </form>
    </div>
  );
};


interface AdminDashboardProps {
  initialMachines: Machine[];
}

import { useEffect } from 'react';

const AdminDashboard = ({ initialMachines }: AdminDashboardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [machines, setMachines] = useState(initialMachines);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [stats, setStats] = useState<{ users: number; merchants: number; machines: number; sessions: number } | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats').then(res => res.json()).then(setStats);
  }, []);

  const refreshMachines = async () => {
    const response = await fetch('/api/admin/machines');
    const data = await response.json();
    setMachines(data);
  };

  if (!isAuthenticated) {
    return <PasswordProtect onAuth={() => setIsAuthenticated(true)} />;
  }

  return (
    <div>
      {/* Блок аналитики */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-amber-400">{stats?.users ?? '...'}</div>
          <div className="text-xs text-gray-400 mt-1">Пользователей</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">{stats?.merchants ?? '...'}</div>
          <div className="text-xs text-gray-400 mt-1">Мерчантов</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-400">{stats?.machines ?? '...'}</div>
          <div className="text-xs text-gray-400 mt-1">Серверов</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-pink-400">{stats?.sessions ?? '...'}</div>
          <div className="text-xs text-gray-400 mt-1">Сессий</div>
        </div>
      </div>
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Управление машинами</h2>
        <button 
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="px-5 py-2 font-semibold text-black bg-[#FFB648] rounded-md hover:bg-amber-500 transition-colors"
        >
          {isFormVisible ? 'Скрыть форму' : '+ Добавить машину'}
        </button>
      </div>
      
      {isFormVisible && <MachineForm onSuccess={refreshMachines} />}
      
      <MachineList machines={machines} onUpdate={refreshMachines} />
    </div>
  );
};

const MachineList = ({ machines, onUpdate }: { machines: Machine[], onUpdate: () => void }) => {
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту машину?')) {
      await fetch(`/api/admin/machines/${id}`, { method: 'DELETE' });
      onUpdate();
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mt-6">
      {editingMachine && <MachineForm machine={editingMachine} onSuccess={() => { setEditingMachine(null); onUpdate(); }} />}
      <div className="space-y-4">
        {machines.map(machine => (
          <div key={machine.id} className="flex items-center justify-between bg-gray-900 p-4 rounded-md">
            <div>
              <p className="font-bold text-white">{machine.name} <span className="text-sm font-mono text-gray-500">({machine.gpu})</span></p>
              <p className="text-sm text-gray-400">{machine.ipAddress}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                machine.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' :
                machine.status === 'BUSY' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {machine.status}
              </span>
              <button onClick={() => setEditingMachine(machine)} className="text-blue-400 hover:text-blue-300">Изменить</button>
              <button onClick={() => handleDelete(machine.id)} className="text-red-400 hover:text-red-300">Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MachineForm = ({ machine, onSuccess }: { machine?: Machine, onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: machine?.name || '',
    cpu: machine?.cpu || '',
    gpu: machine?.gpu || '',
    ram: machine?.ram || '',
    ipAddress: machine?.ipAddress || '',
    sunshine_username: machine?.sunshine_username || '',
    sunshine_password: machine?.sunshine_password || '',
    status: machine?.status || 'AVAILABLE',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = machine ? `/api/admin/machines/${machine.id}` : '/api/admin/machines';
    const method = machine ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8 space-y-4">
      <h3 className="text-xl font-semibold text-white">{machine ? 'Редактировать машину' : 'Добавить новую машину'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Название (e.g. Server RTX 4090 #1)" required className="p-2 bg-gray-900 rounded-md text-white" />
        <input name="gpu" value={formData.gpu} onChange={e => setFormData({...formData, gpu: e.target.value})} placeholder="Видеокарта (e.g. RTX 4090)" required className="p-2 bg-gray-900 rounded-md text-white" />
        <input name="cpu" value={formData.cpu} onChange={e => setFormData({...formData, cpu: e.target.value})} placeholder="Процессор (e.g. Intel Core i9-13900K)" required className="p-2 bg-gray-900 rounded-md text-white" />
        <input name="ram" value={formData.ram} onChange={e => setFormData({...formData, ram: e.target.value})} placeholder="ОЗУ (e.g. 32GB DDR5)" required className="p-2 bg-gray-900 rounded-md text-white" />
        <input name="ipAddress" value={formData.ipAddress} onChange={e => setFormData({...formData, ipAddress: e.target.value})} placeholder="IP Адрес" required className="p-2 bg-gray-900 rounded-md text-white" />
        <input name="sunshine_username" value={formData.sunshine_username} onChange={e => setFormData({...formData, sunshine_username: e.target.value})} placeholder="Sunshine Admin Username" required className="p-2 bg-gray-900 rounded-md text-white" />
        <input name="sunshine_password" type="password" value={formData.sunshine_password} onChange={e => setFormData({...formData, sunshine_password: e.target.value})} placeholder="Sunshine Admin Password" required className="p-2 bg-gray-900 rounded-md text-white" />
      </div>
      <select name="status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as MachineStatus})} className="p-2 bg-gray-900 rounded-md text-white w-full">
        <option value="AVAILABLE">AVAILABLE</option>
        <option value="BUSY">BUSY</option>
        <option value="MAINTENANCE">MAINTENANCE</option>
      </select>
      <button type="submit" className="w-full p-3 font-semibold text-black bg-[#FFB648] rounded-md hover:bg-amber-500 transition-colors">
        {machine ? 'Сохранить изменения' : 'Добавить машину'}
      </button>
    </form>
  );
};


export default AdminDashboard;