"use client";
import { useEffect, useState } from "react";
import DataTable, { Column } from "@/components/ui/DataTable";

interface Machine {
  id: string;
  name: string;
}

interface SessionHistory {
  id: string;
  machine: Machine;
  startTime: string;
  endTime: string;
  maxMinutes: number | null;
}

export default function DashboardHistory() {
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions/history")
      .then((res) => res.json())
      .then((data) => setSessions(data))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<SessionHistory>[] = [
    {
      key: "machine",
      header: "Машина",
      render: (machine: Machine) => machine?.name || "-",
    },
    {
      key: "startTime",
      header: "Начало",
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      key: "endTime",
      header: "Конец",
      render: (val: string) => val ? new Date(val).toLocaleString() : "-",
    },
    {
      key: "maxMinutes",
      header: "Макс. мин.",
      render: (val: number | null) => val ? `${val} мин` : "-",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">История сессий</h1>
      <DataTable
        columns={columns}
        data={sessions}
        keyField="id"
        loading={loading}
        emptyMessage="Нет завершённых сессий"
      />
    </div>
  );
}
