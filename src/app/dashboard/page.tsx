"use client";

import { useState, useEffect } from "react";
import DataTable, { StatusBadge, DurationDisplay, Column } from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import SessionDetailsModal from "@/components/SessionDetailsModal";
import { Session } from "@/types/session";





export default function DashboardHome() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/sessions/active');
        const data = await res.json();
        setSessions(data);
      } catch {
        showToast('Не удалось загрузить сессии', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [showToast]);

  const endSession = async (id: string) => {
    try {
      const res = await fetch('/api/sessions/active', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Ошибка завершения сессии');
      showToast('Сессия завершена', 'success');
      // Обновить список
      const updated = await fetch('/api/sessions/active');
      setSessions(await updated.json());
    } catch {
      showToast('Не удалось завершить сессию', 'error');
    }
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const columns: Column<Session>[] = [
    {
      key: 'machineName',
      header: 'Машина / Игра',
      render: (value: Session['machineName'], row: Session) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-zinc-400">{row.game}</div>
        </div>
      ),
    },
    {
      key: 'startedAt',
      header: 'Начало сессии',
      sortable: true,
      render: (value: Session['startedAt']) => new Date(value).toLocaleTimeString(),
    },
    {
      key: 'duration',
      header: 'Длительность',
      sortable: true,
      render: (value: Session['duration']) => <DurationDisplay minutes={value} />,
    },
    {
      key: 'status',
      header: 'Статус',
      render: (value: Session['status']) => <StatusBadge status={value} />,
    },
    {
      key: 'actions' as keyof Session,
      header: '',
      render: () => (
        <div className="flex justify-end">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              showToast('Функция завершения сессии скоро будет доступна', 'info');
            }}
          >
            Завершить
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Активные сессии</h1>
        <Button 
          variant="primary"
          onClick={() => {
            // TODO: Редирект на страницу выбора машины
            window.location.href = '/servers';
          }}
        >
          Новая сессия
        </Button>
      </div>

      <div className="bg-zinc-900/50 rounded-xl p-4">
        <DataTable
          columns={columns}
          data={sessions}
          keyField="id"
          loading={loading}
          emptyMessage="Нет активных сессий"
          onRowClick={(row) => {
            setSelectedSession(row);
            setIsModalOpen(true);
          }}
        />
      </div>

      <SessionDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        session={selectedSession}
        onEnd={endSession}
      />
    </div>
  );
}
