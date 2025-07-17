'use client';

import { useEffect, useState } from 'react';
import { getStatsSummary } from '@/lib/api';

export function StatsSummary() {
  const [stats, setStats] = useState({
    activeSessions: 0,
    dailyRevenue: 0,
    uptime: 0,
    sessionHistory: []
  });

  useEffect(() => {
    getStatsSummary()
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <StatCard title="Active Sessions" value={stats.activeSessions.toString()} />
        <StatCard title="Daily Revenue" value={`$${stats.dailyRevenue.toFixed(2)}`} />
        <StatCard title="Uptime" value={`${stats.uptime.toFixed(1)}%`} />
      </div>
      
      {/* Chart placeholder */}
      <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
        <p className="text-gray-500">Session history chart</p>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-gray-50 p-4 rounded">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
