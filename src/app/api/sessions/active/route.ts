import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json([], { status: 200 });
  }
  const active = await prisma.session.findMany({
    where: {
      userId: session.user.id,
      endTime: null,
    },
    include: {
      machine: true
    },
    orderBy: { startTime: 'desc' },
  });
  const mapped = active.map((s) => ({
    id: s.id,
    machineName: s.machine?.name || '',
    game: '', // Нет связи с Game в Session, можно доработать если нужно
    startedAt: s.startTime,
    duration: Math.floor((Date.now() - new Date(s.startTime).getTime()) / 60000),
    status: s.endTime ? 'completed' : 'active',
    ipAddress: s.machine?.ipAddress || '',
  }));
  return NextResponse.json(mapped);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await req.json();
  // Завершаем сессию (ставим endTime)
  await prisma.session.update({
    where: { id },
    data: { endTime: new Date() },
  });
  return NextResponse.json({ success: true });
}
