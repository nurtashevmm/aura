"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from "@/components/ui/ToastProvider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast("Неверная ссылка восстановления.", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Пароль должен быть не короче 6 символов.", "error");
      return;
    }
    if (password !== confirm) {
      showToast("Пароли не совпадают.", "error");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (res.ok) {
      showToast("Пароль успешно изменён! Теперь вы можете войти.", "success");
      setTimeout(() => router.push("/auth/signin"), 1500);
    } else {
      const data = await res.json();
      showToast(data.error || "Ошибка восстановления пароля", "error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-zinc-900 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Восстановление пароля</h2>
      <form onSubmit={handleReset}>
        <Input
          type="password"
          placeholder="Новый пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3"
          required
        />
        <Input
          type="password"
          placeholder="Повторите пароль"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mb-3"
          required
        />
        <Button variant="primary" type="submit" className="w-full" disabled={loading}>
          {loading ? 'Сохраняем...' : 'Сбросить пароль'}
        </Button>
      </form>
    </div>
  );
}
