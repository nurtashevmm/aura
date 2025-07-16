import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { rateLimit } from '@/lib/rateLimit';

// POST /api/sessions/heartbeat { sessionId: string }
export async function POST(req: NextRequest) {
  // Rate limit: 30 heartbeat на IP в 5 минут
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (rateLimit({ key: `heartbeat:${ip}`, limit: 30, windowMs: 300_000 })) {
    return NextResponse.json({ error: 'Слишком много heartbeat. Попробуйте позже.' }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { sessionId } = await req.json();
  if (!sessionId) {
    return NextResponse.json({ error: 'No sessionId' }, { status: 400 });
  }
  // Проверяем, что сессия принадлежит пользователю и не завершена
  const gameSession = await prisma.session.findFirst({
    where: {
      id: sessionId,
      userId: session.user.id,
      endTime: null,
    },
  });
  if (!gameSession) {
    return NextResponse.json({ error: 'Session not found or already ended' }, { status: 404 });
  }
  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: { lastHeartbeat: new Date() },
  });
  return NextResponse.json({ ok: true, lastHeartbeat: updated.lastHeartbeat });
}
