import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET /api/transactions — история пользователя
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = req.nextUrl || {};
  const typeParam = searchParams?.get ? searchParams.get('type') : undefined;
  const where: Record<string, unknown> = { userId: session.user.id };
  if (typeParam) (where as Record<string, unknown>).type = typeParam;
  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json(transactions);
}

// POST /api/transactions — создать операцию (для админки/ручных операций)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // TODO: Проверка прав (admin/merchant)
  const { type, amount, description, userId } = await req.json();
  if (!type || !amount || !userId) {
    return NextResponse.json({ error: 'type, amount, userId обязательны' }, { status: 400 });
  }
  const tx = await prisma.transaction.create({
    data: { type, amount, description, userId },
  });
  return NextResponse.json(tx);
}
