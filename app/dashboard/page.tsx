'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { User, ComputeResource } from '@prisma/client';

interface ConnectionInfo { ipAddress: string; connectionPin: string | null; }

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [resources, setResources] = useState<ComputeResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSessionInfo, setActiveSessionInfo] = useState<ConnectionInfo | null>(null);
  
  const fetchData = () => {
    Promise.all([
      axios.get('/api/user/me'),
      axios.get('/api/resources')
    ]).then(([userRes, resourcesRes]) => {
      setUserData(userRes.data);
      setResources(resourcesRes.data);
    }).catch(error => {
      console.error("Ошибка загрузки данных", error);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const handlePlay = async (resourceId: string) => {
    try {
      const response = await axios.post('/api/sessions/start', { resourceId });
      setActiveSessionInfo(response.data.connectionInfo);
      fetchData(); // Обновляем данные после начала сессии (статус машины изменится)
    } catch (error: any) {
      alert(`Ошибка: ${error.response?.data || 'Не удалось начать сессию'}`);
    }
  };
  
  const handleEndSession = () => {
    alert('Логика завершения сессии будет здесь!');
    setActiveSessionInfo(null);
    fetchData(); // Обновляем данные после завершения сессии
  };

  if (isLoading) {
    return <p className="text-center text-white mt-10">Загрузка...</p>;
  }
  
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-4xl p-8">
        <div className="flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg shadow-xl">
          <div>
            <p className="text-gray-400">Добро пожаловать, {userData?.email}!</p>
            <p className="text-xl font-bold text-green-400">Баланс: {(userData?.balance || 0).toFixed(2)} ₸</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Выйти</button>
        </div>
        
        {activeSessionInfo ? (
          <div className="bg-cyan-900/50 border border-cyan-500 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-cyan-300">Сессия активна!</h2>
            <p className="mt-2 text-gray-300">Используйте эти данные для подключения в Moonlight:</p>
            <div className="mt-4 bg-gray-900 p-4 rounded-md font-mono text-lg">
              <p>IP Адрес: <span className="text-green-400">{activeSessionInfo.ipAddress}</span></p>
              {activeSessionInfo.connectionPin && <p>PIN: <span className="text-green-400">{activeSessionInfo.connectionPin}</span></p>}
            </div>
            <button onClick={handleEndSession} className="mt-6 bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-600 font-bold">Завершить сессию</button>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">Выберите машину для игры</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map(res => (
                <div key={res.id} className="bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{res.name}</h3>
                    <p className="text-sm text-cyan-400 mb-2">{res.tier}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-lg font-semibold">{res.hourlyRate.toFixed(2)} ₸/час</p>
                    <button onClick={() => handlePlay(res.id)} className="bg-green-600 px-6 py-2 rounded-lg hover:bg-green-700 transition">Играть</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}