import React, { useEffect, useState } from 'react';

export type ContentBlock = {
  id: string;
  blockId: string;
  content: string;
};

export default function AdminContentPanel() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [blockId, setBlockId] = useState('');

  useEffect(() => {
    fetch('/api/content-blocks')
      .then(res => res.json())
      .then(data => {
        setBlocks(data);
        setLoading(false);
      });
  }, []);

  const handleEdit = (block: ContentBlock) => {
    setEditId(block.id);
    setContent(block.content);
    setBlockId(block.blockId);
  };

  const handleSave = async () => {
    await fetch('/api/content-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId, content }),
    });
    setEditId(null);
    setLoading(true);
    fetch('/api/content-blocks')
      .then(res => res.json())
      .then(data => {
        setBlocks(data);
        setLoading(false);
      });
  };

  const handleNew = () => {
    setEditId('new');
    setBlockId('');
    setContent('');
  };

  if (loading) return <div>Загрузка контента...</div>;

  return (
    <div>
      
      <h2 className="text-xl font-bold mb-4">Управление контентом</h2>
      <button className="mb-4 px-4 py-2 bg-green-600 text-white rounded" onClick={handleNew}>
        Добавить блок
      </button>
      <table className="w-full text-left mb-4">
        <thead>
          <tr className="bg-zinc-800">
            <th className="p-2">ID блока</th>
            <th className="p-2">Контент</th>
            <th className="p-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map(block => (
            <tr key={block.id} className="border-b border-zinc-700">
              <td className="p-2 font-mono text-xs">{block.blockId}</td>
              <td className="p-2 max-w-lg truncate">{block.content.slice(0, 80)}...</td>
              <td className="p-2">
                <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={() => handleEdit(block)}>
                  Редактировать
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editId && (
        <div className="bg-zinc-800 p-4 rounded mb-4">
          <input
            type="text"
            placeholder="ID блока (например, main_banner)"
            value={blockId}
            onChange={e => setBlockId(e.target.value)}
            className="w-full p-2 rounded bg-zinc-700 text-white mb-2"
            disabled={editId !== 'new'}
          />
          <textarea
            rows={6}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full p-2 rounded bg-zinc-700 text-white mb-2"
          />
          <button className="px-4 py-2 bg-green-600 text-white rounded mr-2" onClick={handleSave}>
            Сохранить
          </button>
          <button className="px-4 py-2 bg-zinc-600 text-white rounded" onClick={() => setEditId(null)}>
            Отмена
          </button>
        </div>
      )}
    </div>
  );
}
