import React, { useState } from 'react';
import ImageUploadField from '../ImageUploadField';

export interface GameFormData {
  title: string;
  description?: string;
  coverUrl?: string;
  minPrice?: number;
}

export type GameFormProps = {
  initial?: Partial<GameFormData>;
  onSubmit: (data: GameFormData) => void;
};

export default function GameForm({ initial, onSubmit }: GameFormProps) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    coverUrl: initial?.coverUrl || '',
    minPrice: initial?.minPrice || 0,
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
        <label className="block font-semibold mb-1">Название</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded bg-zinc-800 text-white"
          required
        />
      </div>
      <ImageUploadField
        value={form.coverUrl}
        onChange={url => setForm(f => ({ ...f, coverUrl: url }))}
        label="Обложка игры"
      />
      <div className="mb-4">
        <label className="block font-semibold mb-1">Минимальная цена (₸/час)</label>
        <input
          name="minPrice"
          type="number"
          value={form.minPrice}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded bg-zinc-800 text-white"
          required
        />
      </div>
      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 text-white rounded font-bold"
        disabled={submitting}
      >
        {submitting ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  );
}
