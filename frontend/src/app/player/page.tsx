"use client";
import { useEffect, useState } from "react";
import {
  getBalance,
  topUpBalance,
  listPcs,
  startSession,
  stopSession,
  processKaspiPayment,
  processPayment,
} from "@/lib/api";
import Link from 'next/link';

export default function Player() {
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>("");
  const [pcs, setPcs] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('kaspi');

  useEffect(() => {
    async function init() {
      const bal = await getBalance();
      setBalance(bal);
      setPcs(await listPcs());
    }
    init();
  }, []);

  const handleTopUp = async () => {
    await topUpBalance(parseInt(amount, 10));
    setBalance(await getBalance());
    setAmount("");
  };

  const handleConnect = async (pc: string) => {
    await startSession(pc);
    // Redirect to moonlight URI
    window.location.href = `moonlight://connect?address=${pc}`;
  };

  const handleStop = async (pc: string) => {
    await stopSession(pc);
  };

  const handlePayment = async () => {
    if (paymentMethod === 'kaspi') {
      await processKaspiPayment(parseInt(amount, 10), '+77771234567');
    } else {
      await processPayment(parseInt(amount, 10), paymentMethod);
    }
    setBalance(await getBalance());
    setAmount('');
  };

  return (
    <main className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Player Dashboard</h1>

      <section className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Balance</h2>
        <div className="space-y-4">
          <Link 
            href="/balance/topup"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
          >
            Top Up Balance via Kaspi
          </Link>
          <div className="flex items-center gap-4">
            <p>Your balance: {(balance / 100).toFixed(2)}₸</p>
          </div>
        </div>
      </section>

      <section className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Top Up Balance</h2>
        <div className="flex space-x-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (cents)"
            className="border p-2 rounded flex-1"
          />
          <div className="space-y-2">
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="kaspi">Kaspi Pay</option>
              <option value="card">Credit Card</option>
            </select>
            <button 
              onClick={handlePayment}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Top Up Balance
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Available PCs</h2>
        {pcs.length === 0 ? (
          <p className="text-gray-500">No PCs online</p>
        ) : (
          <ul className="space-y-2">
            {pcs.map((pc) => (
              <li
                key={pc}
                className="flex justify-between items-center border rounded p-2"
              >
                <span>{pc}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleConnect(pc)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Connect
                  </button>
                  <button
                    onClick={() => handleStop(pc)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Stop
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
