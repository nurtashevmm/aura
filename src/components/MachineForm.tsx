import React, { useState } from 'react';
import Image from 'next/image';

export interface MachineFormData {
  publicName: string;
  cpu: string;
  gpu: string;
  ram: string;
  hourlyRate: number;
  os?: string;
  ipAddress?: string;
  type?: string;
  tier?: string;
  screenshotUrl?: string;
  tailscaleIp?: string;
  sunshinePin?: string;
  games?: string[];
}

export interface GameOption {
  id: string;
  title: string;
}

export type MachineFormProps = {
  onSubmit: (data: MachineFormData) => void;
  initial?: MachineFormData;
  games?: GameOption[];
};

export default function MachineForm({ onSubmit, initial, games = [] }: MachineFormProps) {
  const [form, setForm] = useState({
    publicName: initial?.publicName || '',
    cpu: initial?.cpu || '',
    gpu: initial?.gpu || '',
    ram: initial?.ram || '',
    os: initial?.os || '',
    ipAddress: initial?.ipAddress || '',
    hourlyRate: initial?.hourlyRate || 0,
    type: initial?.type || '',
    tier: initial?.tier || '',
    screenshotUrl: initial?.screenshotUrl || '',
    tailscaleIp: initial?.tailscaleIp || '',
    sunshinePin: initial?.sunshinePin || '',
    games: (initial?.games as string[] | undefined) || [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleGamesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setForm(f => ({ ...f, games: selected }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setForm(f => ({ ...f, screenshotUrl: data.url }));
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-zinc-900 p-4 rounded">
      <input name="publicName" value={form.publicName} onChange={handleChange} placeholder="Публичное имя" className="w-full p-2 rounded bg-zinc-800 text-white" required />
      <input name="cpu" value={form.cpu} onChange={handleChange} placeholder="CPU" className="w-full p-2 rounded bg-zinc-800 text-white" required />
      <input name="gpu" value={form.gpu} onChange={handleChange} placeholder="GPU" className="w-full p-2 rounded bg-zinc-800 text-white" required />
      <input name="ram" value={form.ram} onChange={handleChange} placeholder="RAM" className="w-full p-2 rounded bg-zinc-800 text-white" required />
      <input name="os" value={form.os} onChange={handleChange} placeholder="ОС" className="w-full p-2 rounded bg-zinc-800 text-white" required />
      <input name="ipAddress" value={form.ipAddress} onChange={handleChange} placeholder="Tailscale IP" className="w-full p-2 rounded bg-zinc-800 text-white" required />
      <input name="hourlyRate" type="number" value={form.hourlyRate} onChange={handleChange} placeholder="Цена за час" className="w-full p-2 rounded bg-zinc-800 text-white" required />
      <input name="type" value={form.type} onChange={handleChange} placeholder="Тип (ПК/PS)" className="w-full p-2 rounded bg-zinc-800 text-white" required />
      <input name="tier" value={form.tier} onChange={handleChange} placeholder="Tier (уровень)" className="w-full p-2 rounded bg-zinc-800 text-white" required />
      <label className="block text-white">Загрузить скриншот:
        <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="block mt-1" />
        {uploading && <span className="text-xs text-zinc-400 ml-2">Загрузка...</span>}
        {form.screenshotUrl && (
          <Image src={form.screenshotUrl} alt="Скриншот" width={128} height={80} className="w-32 h-20 object-contain mt-2" />
        )}
      </label>
      <input name="tailscaleIp" value={form.tailscaleIp} onChange={handleChange} placeholder="Tailscale IP" className="w-full p-2 rounded bg-zinc-800 text-white" required />
      <input name="sunshinePin" value={form.sunshinePin} onChange={handleChange} placeholder="Sunshine PIN" className="w-full p-2 rounded bg-zinc-800 text-white" required />
      <label className="block text-white">Выберите установленные игры:
        <select multiple name="games" value={form.games} onChange={handleGamesChange} className="w-full p-2 rounded bg-zinc-800 text-white">
          {games.map(game => (
            <option key={game.id} value={game.id}>{game.title}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="w-full py-2 bg-green-600 text-white rounded" disabled={submitting}>
        {submitting ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  );
}
