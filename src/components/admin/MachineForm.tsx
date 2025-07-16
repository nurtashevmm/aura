import React, { useState } from 'react';
import ImageUploadField from '../ImageUploadField';

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

export type MachineFormProps = {
  games?: { id: string; title: string; }[];
  initial?: Partial<MachineFormData>;
  onSubmit: (data: MachineFormData) => void;
};

export default function MachineForm({ initial, onSubmit }: MachineFormProps) {
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
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-zinc-900 rounded">
      <div className="mb-4">
        <label className="block font-semibold mb-1">Публичное имя</label>
        <input name="publicName" value={form.publicName} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white" required />
      </div>
      <ImageUploadField value={form.screenshotUrl} onChange={url => setForm(f => ({ ...f, screenshotUrl: url }))} label="Скриншот железа" />
      <div className="mb-4">
        <label className="block font-semibold mb-1">CPU</label>
        <input name="cpu" value={form.cpu} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white" required />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">GPU</label>
        <input name="gpu" value={form.gpu} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white" required />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">RAM</label>
        <input name="ram" value={form.ram} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white" required />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">OS</label>
        <input name="os" value={form.os} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white" />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">IP-адрес</label>
        <input name="ipAddress" value={form.ipAddress} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white" required />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Цена (₸/час)</label>
        <input name="hourlyRate" type="number" value={form.hourlyRate} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white" required />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Тип</label>
        <input name="type" value={form.type} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white" />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Тариф</label>
        <input name="tier" value={form.tier} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white" />
      </div>
      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-bold" disabled={submitting}>
        {submitting ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  );
}
