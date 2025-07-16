import React, { useState } from 'react';

export default function WithdrawBlock({ balance, onSuccess, onError }: {
  balance: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      onError('Введите корректную сумму');
      return;
    }
    if (num > balance) {
      onError('Недостаточно средств');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/balance/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: num }),
    });
    setLoading(false);
    if (res.ok) {
      setAmount('');
      onSuccess();
    } else {
      let msg = 'Ошибка вывода средств';
      try {
        const err = await res.json();
        msg = err.error || msg;
      } catch {}
      onError(msg);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="number"
        min="1"
        max={balance}
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Сумма для вывода"
        className="px-2 py-1 rounded border border-zinc-300 w-32 bg-zinc-900 text-white"
        disabled={loading}
      />
      <button
        className="px-3 py-1 bg-green-600 text-white rounded disabled:bg-zinc-700"
        onClick={handleWithdraw}
        disabled={loading || !amount || Number(amount) <= 0 || Number(amount) > balance}
      >
        {loading ? '...' : 'Вывести средства'}
      </button>
    </div>
  );
}
