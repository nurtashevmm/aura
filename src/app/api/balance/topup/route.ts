import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

import { BalanceTopupSchema } from '@/lib/zod/balance';

// POST /api/balance/topup { amount: number }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await req.json();
  const parse = BalanceTopupSchema.safeParse(data);
  if (!parse.success) {
    return NextResponse.json({ error: 'Validation error', details: parse.error.errors }, { status: 400 });
  }
  const { amount } = parse.data;
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { balance: { increment: amount } },
    select: { id: true, balance: true }
  });
  // Записать транзакцию
  await prisma.transaction.create({
    data: {
      userId: session.user.id,
      type: 'topup',
      amount,
      description: 'Пополнение баланса',
    }
  });
  return NextResponse.json(user);
}
