import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import WithdrawBlock from './WithdrawBlock';
import MachineForm from './admin/MachineForm';
import type { MachineFormData } from './admin/MachineForm';
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
  moderationComment?: string;
  screenshotUrl?: string;
  tailscaleIp?: string;
  sunshinePin?: string;
  sessionsCount?: number;
  totalIncome?: number;
  totalMinutes?: number;
};

const TELEGRAM_BOT_LINK = 'https://t.me/your_support_bot';

export default function MerchantDashboard() {
  const { showToast } = useToast();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [games, setGames] = useState<{ id: string; title: string }[]>([]);
  
interface Transaction {
  id: string;
  type: string;
  amount: number;
  description?: string;
  status?: string;
  createdAt: string;
}
const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTx, setShowTx] = useState(false);
  const [txType, setTxType] = useState<string>('');

  useEffect(() => {
    fetch('/api/merchant/me')
      .then(res => res.json())
      .then(data => {
        setMachines(data.machines);
        setBalance(data.balance);
        setLoading(false);
      });
    fetch('/api/merchant/stat')
      .then(res => res.json())
      .then(stats => {
        setMachines(machines => machines.map(m => ({
          ...m,
          sessionsCount: stats[m.id]?.sessionsCount || 0,
          totalIncome: stats[m.id]?.totalIncome || 0,
          totalMinutes: stats[m.id]?.totalMinutes || 0,
        })));
      });
    fetch('/api/games')
      .then(res => res.json())
      .then(setGames);
  }, []);

  useEffect(() => {
    if (!showTx) return;
    fetch('/api/transactions' + (txType ? `?type=${txType}` : ''))
      .then(res => res.json())
      .then(setTransactions);
  }, [showTx, txType]);

  const handleAddMachine = async (form: MachineFormData) => {
    try {
      const res = await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast('Сервер успешно добавлен! Ожидает модерации.', 'success');
        setShowForm(false);
        setLoading(true);
        fetch('/api/merchant/me')
          .then(res => res.json())
          .then(data => {
            setMachines(data.machines);
            setBalance(data.balance);
            setLoading(false);
          });
      } else {
        let errMsg = 'Ошибка при добавлении сервера';
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch {}
        showToast(errMsg, 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Ошибка сети при добавлении сервера', 'error');
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Личный кабинет мерчанта</h2>
      <button
        className={`mb-4 px-4 py-2 rounded ${showTx ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-blue-300'}`}
        onClick={() => setShowTx(v => !v)}
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

      <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
        <div className="mb-2 font-semibold text-blue-900">Модерация и поддержка</div>
        <div className="mb-2 text-sm text-blue-800">
          <b>Внимание!</b> Для прохождения модерации вашей машины:
          <ol className="list-decimal ml-5 mt-2 mb-2">
            <li>Добавьте новую машину через форму ниже.</li>
            <li>Скопируйте сгенерированный <b>ID вашей машины</b> из списка ниже (например, <span className="font-mono">3P23H</span>).</li>
            <li>Сделайте скриншот окна программы проверки характеристик (например, HWinfo, CPU-Z и т.д.).</li>
            <li>Отправьте <b>ID</b> и <b>скриншот</b> менеджеру через Telegram-бот поддержки.</li>
          </ol>
          После проверки менеджер вручную присвоит вашей машине статус и при необходимости скорректирует характеристики. Если потребуется, менеджер свяжется с вами для уточнения данных.
        </div>
        <a
          href={TELEGRAM_BOT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Связаться с поддержкой (Telegram)
        </a>
      </div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <span className="font-semibold">Ваш баланс:</span> {balance} ₸
        <button className="ml-4 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setShowForm(true)}>
          + Добавить ПК/консоль
        </button>
        <WithdrawBlock balance={balance} onSuccess={() => {
          showToast('Заявка на вывод средств отправлена!', 'success');
          setLoading(true);
          fetch('/api/merchant/me').then(res => res.json()).then(data => {
            setBalance(data.balance);
            setLoading(false);
          });
        }} onError={(msg: string) => showToast(msg, 'error')} />
      </div>
      <h3 className="text-lg font-semibold mb-2">Мои серверы</h3>
      {machines.length === 0 && <div>Нет добавленных серверов.</div>}
      {machines.map(machine => (
        <div key={machine.id} className="bg-zinc-900 rounded p-4 mb-4">
          <div className="font-bold text-white mb-1">{machine.publicName}</div>
          <div className="text-sm text-zinc-400 mb-1">CPU: {machine.cpu} | GPU: {machine.gpu} | RAM: {machine.ram}</div>
          <div className="text-sm text-zinc-400 mb-1">Цена: {machine.hourlyRate} ₸/час</div>
          <div className="text-xs text-zinc-500 mb-1">Статус: {machine.status}</div>
          {/* Статистика по машине */}
          <div className="text-xs text-green-400 mt-1">
            Сессий: {machine.sessionsCount ?? 0} | Доход: {machine.totalIncome ?? 0} ₸ | Часов аренды: {((machine.totalMinutes ?? 0) / 60).toFixed(1)}
          </div>
          <div className="text-xs text-zinc-500 mb-1">Модерация: {machine.moderationStatus}</div>
          {machine.moderationComment && (
            <div className="text-xs text-red-400 mb-1">Комментарий модератора: {machine.moderationComment}</div>
          )}
          {machine.screenshotUrl && (
            <Image src={machine.screenshotUrl} alt="Скриншот" width={192} height={128} className="w-48 h-32 object-contain mb-2" />
          )}
          <div className="text-xs text-zinc-500 mb-1">Сессий: {machine.sessionsCount || 0}</div>
          <div className="text-xs text-zinc-500 mb-1">Доход: {machine.totalIncome || 0} ₸</div>
          <div className="text-xs text-zinc-500 mb-1">Часов аренды: {machine.totalMinutes ? (machine.totalMinutes/60).toFixed(1) : 0}</div>
          {/* Кнопки редактирования, удаления, статистика — реализовать позже */}
        </div>
      ))}
      {showForm ? (
        <div className="my-4">
          <MachineForm onSubmit={handleAddMachine} games={games} />
          <button className="mt-2 px-4 py-2 bg-zinc-700 text-white rounded" onClick={() => setShowForm(false)}>
            Отмена
          </button>
        </div>
      ) : (
        <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded" onClick={() => setShowForm(true)}>
          Добавить сервер
        </button>
      )}
    </div>
  );
}
