import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Only allow merchants
  if (session.user.role !== 'MERCHANT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // Получаем все транзакции пользователя
  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  // Суммарный доход (только session и topup)
  const totalIncome = transactions
    .filter(t => t.type === 'session' || t.type === 'topup')
    .reduce((sum, t) => sum + t.amount, 0);
  return NextResponse.json({ transactions, totalIncome });
}
