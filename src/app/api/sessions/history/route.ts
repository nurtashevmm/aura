import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET /api/sessions/history — завершённые сессии текущего пользователя
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json([], { status: 200 });
  }
  const history = await prisma.session.findMany({
    where: {
      userId: session.user.id,
      endTime: { not: null },
    },
    orderBy: { endTime: 'desc' },
    include: { machine: true },
  });
  return NextResponse.json(history);
}
