"use client";
import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';

export type ContentBlock = {
  id: string;
  blockId: string;
  content: string;
};

interface Props {
  blockId: string;
  editable?: boolean;
}

export default function ContentBlockEditor({ blockId, editable }: Props) {
  const { showToast } = useToast();
  const [block, setBlock] = useState<ContentBlock | null>(null);
  // default placeholder HTML snippets for various blocks
  const defaultContentMap: Record<string, string> = React.useMemo(() => ({
    main_banner: `<h2 class="text-4xl font-extrabold mb-4">Играй в любые ПК-игры в облаке</h2><p class="text-lg">AURA Play позволяет арендовать мощный игровой ПК или консоль у других пользователей за считанные секунды.</p><a href="#machines" class="inline-block mt-4 px-6 py-3 bg-blue-600 rounded text-white font-semibold">Выбрать компьютер</a>`,
    how_it_works: `<h3 class="text-2xl font-bold mb-3">Как это работает?</h3><ol class="list-decimal ml-6 space-y-2"><li><b>Выберите</b> свободную машину и игру.</li><li><b>Оплатите</b> время сессии.</li><li><b>Подключитесь</b> через Moonlight / Chiaki и наслаждайтесь игрой!</li></ol>`,
  }), []);


  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/content-blocks`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((b: ContentBlock) => b.blockId === blockId);
        setBlock(found);
        setContent(found ? found.content : (defaultContentMap[blockId] || ''));
        setLoading(false);
      });
  }, [blockId, defaultContentMap]);

  const saveBlock = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/content-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId, content }),
      });
      if (res.ok) {
        showToast('Контент успешно сохранён!', 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Ошибка при сохранении контента', 'error');
      }
    } catch {
      showToast('Ошибка сети при сохранении', 'error');
    }
    setSaving(false);
  };

  if (loading) return <div>Загрузка контента...</div>;

  if (editable) {
    return (
      <div className="mb-4">
        <div className="mb-2 text-xs text-gray-400">Можно использовать базовый HTML (например, <b>&lt;b&gt;жирный&lt;/b&gt;</b>, <b>&lt;a href=&quot;&quot;&gt;ссылка&lt;/a&gt;</b>).</div>
        <textarea
          className="w-full p-2 rounded bg-zinc-800 text-white"
          rows={6}
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={saveBlock}
          disabled={saving}
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
        <div className="mt-4">
          <div className="font-semibold mb-1 text-sm text-gray-300">Предпросмотр:</div>
          <div className="bg-zinc-900 p-3 rounded text-white prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    );
  }

  const htmlToRender = block?.content || defaultContentMap[blockId] || 'Нет контента.';
  return (
    <div className="bg-zinc-900 p-3 rounded text-white prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlToRender }} />
  );
}
