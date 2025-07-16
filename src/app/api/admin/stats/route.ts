import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET /api/admin/stats — агрегированная статистика для админки
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const [users, merchants, machines, sessions] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'MERCHANT' } }),
    prisma.machine.count(),
    prisma.session.count(),
  ]);
  return NextResponse.json({ users, merchants, machines, sessions });
}
