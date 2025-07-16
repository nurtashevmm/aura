import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// Получить список заявок на вывод для админки
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const withdrawals = await prisma.transaction.findMany({
    where: { type: 'withdraw' },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json(withdrawals);
}

// Изменить статус заявки на вывод
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, status } = await req.json();
  if (!id || !['pending','done','rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }
  // Статуса нет в модели Transaction, поэтому просто сохраняем в description
  const tx = await prisma.transaction.update({
    where: { id },
    data: { description: `status:${status}` },
  });
  return NextResponse.json(tx);
}
