import React, { useEffect, useState } from 'react';
import Skeleton from './Skeleton';
import { useToast } from '@/components/ui/ToastProvider';

export type Machine = {
  id: string;
  publicName: string;
  cpu: string;
  gpu: string;
  ram: string;
  hourlyRate: number;
  status: string;
  moderationStatus: string;
  tailscaleIp?: string;
  sunshinePin?: string;
};

export type Session = {
  id: string;
  machine: Machine;
  startTime: string;
  endTime?: string;
  temp_username: string;
  temp_password: string;
};

type Transaction = {
  id: string;
  type: string;
  amount: number;
  status?: string | null;
  createdAt: string;
  description?: string;
};

export default function PlayerDashboard() {
  const { showToast } = useToast();
  const [balance, setBalance] = useState<number>(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [history, setHistory] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState<string | null>(null);
  const [heartbeatStatus, setHeartbeatStatus] = useState<'ok' | 'error' | 'pending' | null>(null);
  const [heartbeatError, setHeartbeatError] = useState<string | null>(null);
  const [txType, setTxType] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTx, setShowTx] = useState(false);

  useEffect(() => {
    fetch('/api/transactions' + (txType ? `?type=${txType}` : ''))
      .then(res => res.json())
      .then(setTransactions);
  }, [txType]);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        setBalance(data.balance);
        setSessions(data.sessions);
        fetch('/api/sessions/history')
          .then(res => res.json())
          .then(setHistory);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (sessions.length === 0) return;
    setHeartbeatStatus('pending');
    setHeartbeatError(null);
    let stopped = false;
    const sendHeartbeat = async (sessionId: string) => {
      try {
        const res = await fetch('/api/sessions/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        if (!res.ok) {
          setHeartbeatStatus('error');
          const data = await res.json();
          setHeartbeatError(data.error || 'Ошибка heartbeat');
          if (res.status === 401 || res.status === 404) {
            setSessions(sessions.filter(s => s.id !== sessionId));
          }
        } else {
          setHeartbeatStatus('ok');
          setHeartbeatError(null);
        }
      } catch {
        setHeartbeatStatus('error');
        setHeartbeatError('Ошибка сети');
      }
    };
    sessions.forEach(s => sendHeartbeat(s.id));
    const intervals: NodeJS.Timeout[] = sessions.map(s => setInterval(() => {
      if (!stopped) sendHeartbeat(s.id);
    }, 60000));
    return () => {
      stopped = true;
      intervals.forEach(clearInterval);
    };
  }, [sessions]);

  const handleEndSession = async (sessionId: string) => {
    setEnding(sessionId);
    const res = await fetch('/api/sessions/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    if (res.ok) {
      setSessions(sessions.filter(s => s.id !== sessionId));
      showToast('Сессия завершена', 'success');
    } else {
      showToast('Ошибка завершения сессии: ' + (await res.json()).error, 'error');
    }
    setEnding(null);
  };

  const handleTopup = async (amount: number) => {
    try {
      const res = await fetch('/api/balance/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        showToast('Баланс успешно пополнен!', 'success');
        const user = await res.json();
        setBalance(user.balance);
      } else {
        const err = await res.json();
        showToast(err.error || 'Ошибка при пополнении баланса', 'error');
      }
    } catch {
      showToast('Ошибка сети при пополнении', 'error');
    }
  };

  if (loading) return (
    <div>
      <h2 className="text-xl font-bold mb-4">Личный кабинет игрока</h2>
      <div className="mb-4"><Skeleton className="h-6 w-32 mb-2" /></div>
      <div className="mb-4"><Skeleton className="h-10 w-40" /></div>
      <h3 className="text-lg font-semibold mb-2">Активные сессии</h3>
      <div>
        {[1,2].map(i => (
          <div key={i} className="bg-zinc-900 rounded p-4 mb-4">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-4 w-32 mb-1" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Личный кабинет игрока</h2>
      <button
        className={`mb-4 px-4 py-2 rounded ${showTx ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-blue-300'}`}
        onClick={() => setShowTx((v: boolean) => !v)}
      >
        {showTx ? 'Скрыть историю операций' : 'Показать историю операций'}
      </button>
      {showTx && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">История операций</h3>
          <div className="mb-2">
            <select
              className="px-2 py-1 rounded bg-zinc-900 text-white border border-zinc-600"
              value={txType}
              onChange={e => setTxType(e.target.value)}
            >
              <option value="">Все</option>
              <option value="topup">Пополнение</option>
              <option value="session">Сессия</option>
              <option value="payout">Выплата</option>
              <option value="withdraw">Вывод</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-zinc-800 text-blue-300">
                  <th className="px-2 py-1 text-left">Дата</th>
                  <th className="px-2 py-1 text-left">Тип</th>
                  <th className="px-2 py-1 text-left">Сумма</th>
                  <th className="px-2 py-1 text-left">Описание</th>
                  <th className="px-2 py-1 text-left">Статус</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-2 text-zinc-400">Нет операций</td></tr>
                )}
                {transactions.map(tx => {
                  let icon = '💸';
                  if (tx.type === 'topup') icon = '⬆️';
                  else if (tx.type === 'session') icon = '🎮';
                  else if (tx.type === 'payout') icon = '💰';
                  const isIncome = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="border-b border-zinc-800">
                      <td className="px-2 py-1 whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
                      <td className="px-2 py-1 flex items-center gap-1">{icon} {tx.type}</td>
                      <td className={`px-2 py-1 font-semibold ${isIncome ? 'text-green-400' : 'text-red-400'}`}>{isIncome ? '+' : ''}{(tx.amount/100).toFixed(2)} ₸</td>
                      <td className="px-2 py-1 max-w-xs truncate" title={tx.description}>{tx.description || '-'}</td>
                      <td className="px-2 py-1">
                        {tx.type === 'withdraw' ? (tx.status === 'pending' ? 'В обработке' : tx.status === 'done' ? 'Выполнено' : tx.status === 'rejected' ? 'Отклонено' : tx.status) : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="mb-4">Баланс: <span className="font-mono">{balance} ₸</span></div>
      <div className="mb-4">
        <button className="ml-2 px-3 py-1 bg-green-600 text-white rounded" onClick={() => handleTopup(1000)}>
          +1000 ₸
        </button>
      </div>
      <h3 className="text-lg font-semibold mb-2">Активные сессии</h3>
      {sessions.length === 0 && <div>Нет активных сессий.</div>}
      {sessions.map(session => (
        <div key={session.id} className="bg-zinc-900 rounded p-4 mb-4 w-full max-w-md mx-auto md:max-w-full">
          <div className="font-bold text-white mb-1 break-words">{session.machine.publicName}</div>
          <div className="text-sm text-zinc-400 mb-1">Начало: {new Date(session.startTime).toLocaleString()}</div>
          <div className="text-sm text-zinc-400 mb-1">IP: {session.machine.tailscaleIp || '—'}</div>
          <div className="text-sm text-zinc-400 mb-1">PIN: {session.machine.sunshinePin || '—'}</div>
          <div className="text-sm text-zinc-400 mb-1">Временный логин: {session.temp_username}</div>
          <button
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded w-full md:w-auto"
            disabled={ending === session.id}
            onClick={() => handleEndSession(session.id)}
          >
            {ending === session.id ? 'Завершение...' : 'Завершить'}
          </button>
        </div>
      ))}
      {heartbeatStatus && (
        <div className="mb-2 flex items-center">
          {heartbeatStatus === 'ok' && <span className="text-green-500">● Heartbeat OK</span>}
          {heartbeatStatus === 'pending' && <span className="text-yellow-400">● Heartbeat...</span>}
          {heartbeatStatus === 'error' && <span className="text-red-500">● Heartbeat error: {heartbeatError}</span>}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2 mt-8">История сессий</h3>
      {history.length === 0 && <div>Нет завершённых сессий.</div>}
      {history.map(session => (
        <div key={session.id} className="bg-zinc-800 rounded p-3 mb-2">
          <div className="font-bold text-white mb-1">{session.machine.publicName}</div>
          <div className="text-sm text-zinc-400 mb-1">Начало: {new Date(session.startTime).toLocaleString()}</div>
          <div className="text-sm text-zinc-400 mb-1">Окончание: {session.endTime ? new Date(session.endTime).toLocaleString() : '—'}</div>
          <div className="text-sm text-zinc-400 mb-1">Длительность: {session.endTime ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime())/60000) + ' мин.' : '—'}</div>
        </div>
      ))}
    </div>
  );
}
