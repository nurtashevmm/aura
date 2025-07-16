"use client";

import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import Button from "./ui/Button";

interface SessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    id: string;
    machineName: string;
    game: string;
    startedAt: string;
    duration: number;
    status: string;
    ipAddress: string;
  } | null;
  onEnd?: (id: string) => void;
}

export default function SessionDetailsModal({ isOpen, onClose, session, onEnd }: SessionDetailsModalProps) {
  if (!session) return null;

  const details = [
    { label: 'Машина', value: session.machineName },
    { label: 'Игра', value: session.game },
    { 
      label: 'Начало сессии', 
      value: new Date(session.startedAt).toLocaleString() 
    },
    { 
      label: 'Длительность', 
      value: `${Math.floor(session.duration / 60)}ч ${session.duration % 60}м` 
    },
    { label: 'Статус', value: session.status },
    { label: 'IP-адрес', value: session.ipAddress },
  ];

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      
      <Dialog.Panel className="relative w-full max-w-md glass-bg rounded-xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white transition-colors"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>

        <Dialog.Title className="text-2xl font-bold mb-6">
          Детали сессии
        </Dialog.Title>

        <div className="space-y-4">
          {details.map((item) => (
            <div key={item.label} className="grid grid-cols-3 gap-4">
              <span className="text-zinc-400">{item.label}:</span>
              <span className="col-span-2 font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Закрыть
          </Button>
          <Button 
            variant="primary"
            onClick={() => {
              if (session && onEnd) onEnd(session.id);
            }}
          >
            Завершить сессию
          </Button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
