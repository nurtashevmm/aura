"use client";
import { useEffect, useState } from "react";
import { getStatsSummary } from "@/lib/api";

export default function MerchantDashboard() {
  const [summary, setSummary] = useState<{ sessions_total: number; active_sessions: number }>({
    sessions_total: 0,
    active_sessions: 0,
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getStatsSummary();
        if (mounted) setSummary(data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
    const id = setInterval(load, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const roi = summary.sessions_total === 0 ? 0 : (summary.sessions_total * 50 - 100_000) / 100_000; // stub

  return (
    <main className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Merchant Dashboard</h1>
      <section className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Session Stats</h2>
        <p>Total sessions: {summary.sessions_total}</p>
        <p>Active sessions: {summary.active_sessions}</p>
      </section>
      <section className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">ROI (rough)</h2>
        <p>{(roi * 100).toFixed(1)} %</p>
      </section>
    </main>
  );
}
