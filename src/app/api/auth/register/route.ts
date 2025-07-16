import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { RegisterUserSchema } from '@/lib/zod/user';
import { sendEmail } from '@/lib/sendEmail';

// POST /api/auth/register
export async function POST(req: NextRequest) {
  const data = await req.json();
  const parse = RegisterUserSchema.safeParse(data);
  if (!parse.success) {
    return NextResponse.json({ error: 'Validation error', details: parse.error.errors }, { status: 400 });
  }
  const { name, email, password, role } = parse.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role,
      // phone и telegram можно добавить в схему, если нужно хранить
    },
    select: { id: true, email: true, role: true }
  });

  // Отправить письмо с подтверждением
  await sendEmail({
    to: email,
    subject: 'Добро пожаловать в AURA Play!',
    html: `<div style="font-family:sans-serif;font-size:16px;">
      <h2>Добро пожаловать в AURA Play!</h2>
      <p>Ваш аккаунт успешно создан. Теперь вы можете войти в сервис и начать пользоваться всеми возможностями платформы.</p>
      <p>Если вы не регистрировались на нашем сервисе, просто проигнорируйте это письмо.</p>
    </div>`
  });

  return NextResponse.json(user);
}
