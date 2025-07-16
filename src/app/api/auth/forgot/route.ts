import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/sendEmail';
import crypto from 'crypto';

// POST /api/auth/forgot
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });

  // Генерируем токен
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 час

  // Сохраняем токен в базе (можно сделать отдельную таблицу, либо поле resetToken/resetTokenExpires)
  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpires: expires,
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Восстановление пароля AURA Play',
    html: `<div style="font-family:sans-serif;font-size:16px;">
      <h2>Восстановление пароля</h2>
      <p>Для сброса пароля перейдите по ссылке ниже:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>
    </div>`
  });

  return NextResponse.json({ ok: true });
}
