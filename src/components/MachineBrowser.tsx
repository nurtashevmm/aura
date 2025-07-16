'use client';

import { useState, useEffect } from 'react';
import { Machine } from '@prisma/client';
import { FaServer, FaMemory, FaDesktop, FaCircle } from 'react-icons/fa';
import { useToast } from '@/components/ui/ToastProvider';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface MachineCardProps {
  machine: Machine;
  onShowGames: () => void;
}

const MachineCard = ({ machine, onShowGames }: MachineCardProps) => {
  const isAvailable = machine.status === 'AVAILABLE';
  return (
    <div
      className={`p-6 rounded-lg shadow-lg transition-all duration-300 ${isAvailable ? 'bg-gray-800 hover:shadow-2xl hover:-translate-y-1' : 'bg-gray-900 opacity-60'} w-full max-w-md mx-auto md:max-w-full`}
    >
      <h3 className="text-2xl font-bold text-white break-words">{machine.name}</h3>
      <div className="mt-4 space-y-3 text-gray-300">
        <div className="flex items-center flex-wrap">
          <FaDesktop className="mr-3 text-gray-400" />
          <span>{machine.gpu}</span>
        </div>
        <div className="flex items-center flex-wrap">
          <FaServer className="mr-3 text-gray-400" />
          <span>{machine.cpu}</span>
        </div>
        <div className="flex items-center flex-wrap">
          <FaMemory className="mr-3 text-gray-400" />
          <span>{machine.ram}</span>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center">
        <FaCircle className={`mr-2 ${isAvailable ? 'text-green-500' : 'text-red-500'}`} />
        <span className="text-sm font-semibold text-white">
          {isAvailable ? 'Свободен' : 'Занят'}
        </span>
      </div>
      {isAvailable && (
        <Button className="w-full mt-6" onClick={onShowGames}>
          Узнать список игр
        </Button>
      )}
    </div>
  );
};

interface ConnectionDetailsProps {
  session: { username: string; password: string; ipAddress: string; };
  onEndSession: () => void;
  heartbeatStatus: 'ok' | 'error' | 'pending' | null;
  heartbeatError: string | null;
}

const ConnectionDetails = ({ session, onEndSession, heartbeatStatus, heartbeatError }: ConnectionDetailsProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
      <h2 className="text-3xl font-bold text-white mb-4">Ваш доступ</h2>
      <p className="text-gray-300 mb-6">Используйте эти временные данные для подключения через Moonlight.</p>
      <div className="space-y-4 text-lg">
        <div className="p-4 bg-gray-900 rounded-md">
          <p className="text-gray-400">IP Адрес:</p>
          <p className="text-2xl font-mono text-white tracking-wider">{session.ipAddress}</p>
        </div>
        <div className="p-4 bg-gray-900 rounded-md">
          <p className="text-gray-400">Имя пользователя:</p>
          <p className="text-2xl font-mono text-white tracking-wider">{session.username}</p>
        </div>
        <div className="p-4 bg-gray-900 rounded-md">
          <p className="text-gray-400">Пароль:</p>
          <p className="text-2xl font-mono text-white tracking-wider">{session.password}</p>
        </div>
      </div>
      {heartbeatStatus && (
        <div className="mt-4 flex items-center justify-center">
          {heartbeatStatus === 'ok' && <span className="text-green-500">● Heartbeat OK</span>}
          {heartbeatStatus === 'pending' && <span className="text-yellow-400">● Heartbeat...</span>}
          {heartbeatStatus === 'error' && (
            <span className="text-red-500">● Heartbeat error: {heartbeatError}</span>
          )}
        </div>
      )}
      <Button variant="secondary" className="w-full mt-8 bg-red-600 hover:bg-red-700" onClick={onEndSession}>
        Завершить сессию
      </Button>
    </div>
  </div>
);

interface Game { id: string; title: string; }
interface MachineBrowserProps { machines: Machine[]; }

export default function MachineBrowser({ machines }: MachineBrowserProps) {
  const [machineList, setMachineList] = useState(machines);
  const [activeSession, setActiveSession] = useState<{ sessionId: string; username: string; password: string; ipAddress: string; } | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [heartbeatStatus, setHeartbeatStatus] = useState<'ok' | 'error' | 'pending' | null>(null);
  const [heartbeatError, setHeartbeatError] = useState<string | null>(null);
  const { showToast } = useToast();

  // refresh machines
  const refreshMachines = async () => {
    try {
      const res = await fetch('/api/machines');
      if (!res.ok) throw new Error('Failed to fetch machines');
      setMachineList(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGames = async (machine: Machine) => {
    try {
      setGamesLoading(true);
      const res = await fetch(`/api/machines/${machine.id}/games`);
      if (!res.ok) throw new Error(await res.text());
      setGames(await res.json());
      setSelectedMachine(machine);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) showToast(e.message, 'error');
    } finally {
      setGamesLoading(false);
    }
  };

  const handleSelectMachine = async (machine: Machine, gameId?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ machineId: machine.id, gameId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.moonlightLink) {
        // открываем Moonlight
        window.location.href = data.moonlightLink;
      }
      setActiveSession({ sessionId: data.sessionId, username: '', password: '', ipAddress: machine.ipAddress });
      refreshMachines();
      showToast('Сессия успешно запущена!', 'success');
    } catch (e) {
      console.error(e);
      if (e instanceof Error) showToast(e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    setIsLoading(true);
    try {
      await fetch('/api/sessions/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession.sessionId }),
      });
      setActiveSession(null);
      refreshMachines();
      showToast('Сессия завершена', 'success');
    } catch (e) {
      console.error(e);
      showToast('Не удалось завершить сессию', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // polling
  useEffect(() => {
    const id = setInterval(refreshMachines, 5000);
    return () => clearInterval(id);
  }, []);

  // heartbeat
  useEffect(() => {
    if (!activeSession) return;
    setHeartbeatStatus('pending');
    setHeartbeatError(null);
    let stopped = false;
    const send = async () => {
      try {
        const res = await fetch('/api/sessions/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: activeSession.sessionId }),
        });
        if (!res.ok) {
          setHeartbeatStatus('error');
          const data = await res.json();
          setHeartbeatError(data.error || 'Ошибка heartbeat');
        } else {
          setHeartbeatStatus('ok');
        }
      } catch {
        setHeartbeatStatus('error');
        setHeartbeatError('Ошибка сети');
      }
    };
    send();
    const id = setInterval(() => !stopped && send(), 60000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [activeSession]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-[#FFB648] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* machines grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {machineList.map(m => (
          <MachineCard key={m.id} machine={m} onShowGames={() => fetchGames(m)} />
        ))}
      </div>

      {/* games list modal */}
      <Modal open={!!selectedMachine} onClose={() => setSelectedMachine(null)}>
        <h2 className="text-2xl font-bold mb-4">Список игр – {selectedMachine?.name}</h2>
        {gamesLoading && <p>Загрузка...</p>}
        {!gamesLoading && (
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {games.map(g => (
              <li key={g.id} className="flex justify-between items-center glass-bg px-3 py-2 rounded">
                <span>{g.title}</span>
                <Button variant="secondary" onClick={() => selectedMachine && handleSelectMachine(selectedMachine, g.id)}>
                  Играть
                </Button>
              </li>
            ))}
            {games.length === 0 && <li>Нет игр</li>}
          </ul>
        )}
      </Modal>

      {/* connection details modal */}
      {activeSession && (
        <ConnectionDetails
          session={activeSession}
          onEndSession={handleEndSession}
          heartbeatStatus={heartbeatStatus}
          heartbeatError={heartbeatError}
        />
      )}
    </div>
  );
}
