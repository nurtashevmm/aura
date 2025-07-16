"use client";
import { useEffect, useState } from "react";
import { Session } from "@/types/session";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'PLAYER' | 'MERCHANT' | 'ADMIN';
  balance: number;
  sessions: Session[];
}

export default function DashboardProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setName(data.name || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setError(null);
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password: password || undefined }),
    });
    if (res.ok) {
      setMsg("Профиль успешно обновлён");
      setPassword("");
    } else {
      setError("Ошибка при сохранении профиля");
    }
    setSaving(false);
  };

  if (loading) return <div>Загрузка...</div>;
  if (!user) return <div>Ошибка загрузки профиля</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-neutral-900 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Профиль</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input disabled value={user.email} className="w-full p-2 rounded bg-neutral-800 text-gray-300" />
        </div>
        <div>
          <label className="block text-sm mb-1">Имя</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded bg-neutral-800 text-gray-300" />
        </div>
        <div>
          <label className="block text-sm mb-1">Пароль (новый)</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 rounded bg-neutral-800 text-gray-300" />
        </div>
        <div className="flex gap-4">
          <div className="text-sm text-gray-400">Роль: <span className="font-semibold">{user.role}</span></div>
          <div className="text-sm text-gray-400">Баланс: <span className="font-semibold">{user.balance}₸</span></div>
        </div>
        <button disabled={saving} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded">
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
        {msg && <div className="text-green-500 mt-2">{msg}</div>}
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
    </div>
  );
}
