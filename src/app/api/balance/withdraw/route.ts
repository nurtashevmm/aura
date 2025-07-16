import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// POST /api/balance/withdraw { amount: number }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await req.json();
  const amount = Number(data.amount);
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Некорректная сумма' }, { status: 400 });
  }
  // Получить пользователя и проверить баланс
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (user.balance < amount) {
    return NextResponse.json({ error: 'Недостаточно средств' }, { status: 400 });
  }
  // Списать средства и создать транзакцию
  await prisma.user.update({
    where: { id: session.user.id },
    data: { balance: { decrement: amount } },
  });
  await prisma.transaction.create({
    data: {
      userId: session.user.id,
      type: 'withdraw',
      amount: -amount,
      description: 'Вывод средств',

    },
  });
  // Здесь можно добавить интеграцию с внешней выплатой (банковский перевод, etc)
  return NextResponse.json({ success: true });
}
