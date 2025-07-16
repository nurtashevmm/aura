"use client";
import { useEffect, useState } from "react";

const typeLabels: Record<string, string> = {
  session: "Сессия",
  payout: "Выплата",
  withdraw: "Вывод",
  topup: "Пополнение",
};

interface Transaction {
  id: string;
  type: 'session' | 'payout' | 'withdraw' | 'topup';
  amount: number;
  description?: string;
  createdAt: string;
}

export default function MerchantEarnings() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/merchant/earnings")
      .then((r) => r.json())
      .then(({ transactions, totalIncome }) => {
        setTransactions(transactions);
        setTotalIncome(totalIncome);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? transactions.filter(t => t.type === filter) : transactions;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-neutral-900 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Доход</h1>
      <div className="mb-6 flex items-center gap-8">
        <div className="text-xl font-bold text-green-400">Суммарный доход: {totalIncome / 100}₸</div>
        <div className="flex gap-2">
          <button onClick={() => setFilter(null)} className={`px-3 py-1 rounded ${!filter ? 'bg-yellow-500 text-black' : 'bg-neutral-800 text-gray-300'}`}>Все</button>
          {Object.entries(typeLabels).map(([k, v]) => (
            <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1 rounded ${filter === k ? 'bg-yellow-500 text-black' : 'bg-neutral-800 text-gray-300'}`}>{v}</button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-neutral-800">
              <th className="p-2">Тип</th>
              <th className="p-2">Сумма</th>
              <th className="p-2">Описание</th>
              <th className="p-2">Дата</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center p-4">Загрузка...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-4">Нет транзакций</td></tr>
            ) : (
              filtered.map(t => (
                <tr key={t.id} className="border-b border-neutral-800">
                  <td className="p-2">{typeLabels[t.type] || t.type}</td>
                  <td className={`p-2 ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{t.amount / 100}₸</td>
                  <td className="p-2">{t.description || '-'}</td>
                  <td className="p-2">{new Date(t.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
