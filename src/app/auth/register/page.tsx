"use client";
import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

export default function RegisterPage() {
  const [role, setRole] = useState<'PLAYER' | 'MERCHANT'>('PLAYER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, telegram, role }),
    });
    if (res.ok) {
      showToast('Регистрация успешна! Войдите в аккаунт.', 'success');
    } else {
      const err = await res.json();
      showToast(err.error || 'Ошибка регистрации', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Регистрация</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={e => setName(e.target.value)}
          
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          
          required
        />
        <Input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          
          required
        />
        <Input
          type="text"
          placeholder="Телефон"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          
        />
        <Input
          type="text"
          placeholder="Telegram"
          value={telegram}
          onChange={e => setTelegram(e.target.value)}
          
        />
        <div className="flex gap-4 mb-2">
          <label className="flex items-center gap-2">
            <Input type="radio" name="role" value="PLAYER" checked={role === 'PLAYER'} onChange={() => setRole('PLAYER')} />
            Я Игрок
          </label>
          <label className="flex items-center gap-2">
            <Input type="radio" name="role" value="MERCHANT" checked={role === 'MERCHANT'} onChange={() => setRole('MERCHANT')} />
            Я Мерчант
          </label>
        </div>
        <Button variant="primary" type="submit"  disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
      </form>
    </div>
  );
}
