import React, { useState } from 'react';

// --- Глобальные интерфейсы ---
export interface Game {
  id: string;
  title: string;
  coverUrl: string;
  minPrice: number;
}
export interface Machine {
  id: string;
  publicName: string;
  screenshotUrl: string;
  cpu: string;
  gpu: string;
  ram: string;
  status: string;
}
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  balance: number;
}
export interface CmsBlock {
  id: string;
  blockId: string;
  content: string;
}

const TABS = [

  { key: 'cms', label: 'CMS/Контент' },
];

export default function AdminPanel() {
  const [tab, setTab] = useState('cms');
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`px-4 py-2 rounded font-bold ${tab === t.key ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-200'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        {tab === 'cms' && <CmsAdminSection />}
      </div>
    </div>
  );
}

const CmsAdminSection = () => {
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CmsBlock | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    fetch('/api/content-blocks').then(res => res.json()).then(setBlocks).finally(() => setLoading(false));
  }, []);

  const handleSave = async (data: CmsBlock) => {
    try {
      const method = editing?.id ? 'PUT' : 'POST';
      const url = editing?.id ? `/api/content-blocks/${editing.id}` : '/api/content-blocks';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Ошибка при сохранении');
      
      const savedBlock = await response.json();
      setBlocks(prev => 
        editing?.id 
          ? prev.map(b => b.id === editing.id ? savedBlock : b)
          : [...prev, savedBlock]
      );
      setEditing(null);
    } catch (error) {
      console.error('Ошибка при сохранении блока:', error);
    }
  };

  const filteredBlocks = blocks.filter(block => {
    const matchesFilter = filter === 'ALL' || block.blockId.startsWith(filter);
    const matchesSearch = search === '' || 
      block.blockId.toLowerCase().includes(search.toLowerCase()) || 
      (block.content?.toLowerCase() || '').includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">CMS / Контент</h2>
      <div className="flex gap-2 mb-4">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-2 py-1 rounded bg-zinc-800 text-white">
          <option value="ALL">Все</option>
          <option value="INSTRUCTION">Инструкции</option>
          <option value="BANNER">Баннеры</option>
        </select>
        <input
          type="text"
          placeholder="Поиск по blockId/контенту"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-2 py-1 rounded bg-zinc-800 text-white"
        />
      </div>
      <button className="mb-4 px-4 py-2 bg-green-600 text-white rounded" onClick={() => setEditing({ id: '', blockId: '', content: '' })}>
              Добавить блок
      </button>
      {loading ? <div>Загрузка...</div> : (
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-zinc-800 text-zinc-200">
              <th className="p-2">blockId</th>
              <th className="p-2">Контент (превью)</th>
              <th className="p-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlocks.map(block => (
              <tr key={block.id} className="border-b border-zinc-700">
                <td className="p-2">{block.blockId}</td>
                <td className="p-2 max-w-xs truncate">{block.content?.slice(0, 60)}</td>
                <td className="p-2">
                  <button className="px-2 py-1 bg-blue-600 text-white rounded mr-2" onClick={() => setEditing(block)}>Редактировать</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded shadow-xl w-full max-w-lg">
            <CmsBlockForm initial={editing as CmsBlock} onSubmit={handleSave} />
            <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded" onClick={() => setEditing(null)}>Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
}

type UserFormProps = {
  initial: User;
  onSubmit: (data: User) => void;
};

export const UserForm = ({ initial, onSubmit }: UserFormProps) => {
  const [form, setForm] = useState({ ...initial });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f: User) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">Email</label>
        <input name="email" value={form.email || ''} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white" disabled />
      </div>
      <div>
        <label className="block font-semibold mb-1">Имя</label>
        <input name="name" value={form.name || ''} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white" />
      </div>
      <div>
        <label className="block font-semibold mb-1">Роль</label>
        <select name="role" value={form.role} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white">
          <option value="PLAYER">Игрок</option>
          <option value="MERCHANT">Мерчант</option>
          <option value="ADMIN">Админ</option>
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1">Баланс (₸)</label>
        <input name="balance" type="number" value={form.balance} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white" />
      </div>
      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-bold" disabled={submitting}>
        {submitting ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  );
}

type CmsBlockFormProps = {
  initial: CmsBlock;
  onSubmit: (data: CmsBlock) => void;
};

const CmsBlockForm = ({ initial, onSubmit }: CmsBlockFormProps) => {
  const [form, setForm] = useState({ ...initial });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f: CmsBlock) => ({ ...f, [name]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">blockId</label>
        <input name="blockId" value={form.blockId || ''} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white" required />
      </div>
      <div>
        <label className="block font-semibold mb-1">Контент (HTML, текст)</label>
        <textarea name="content" value={form.content || ''} onChange={handleChange} className="w-full px-3 py-2 rounded bg-zinc-800 text-white" rows={6} />
      </div>
      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-bold" disabled={submitting}>
        {submitting ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  );
}
