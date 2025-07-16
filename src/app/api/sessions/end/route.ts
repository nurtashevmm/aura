import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { createHmac } from 'crypto';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    // Проверка авторизации
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth || !sessionAuth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { machine: true, user: true },
    });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    // Только владелец сессии или админ может завершить
    if (session.userId !== sessionAuth.user.id && sessionAuth.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // --- Очистка PIN через локальный агент мерчанта ---
    try {
      if (session.machine.tailscaleIp) {
        const agentUrl = `http://${session.machine.tailscaleIp}:8800/session/${sessionId}`;
        const signature = createHmac('sha256', (session.machine as any).agentSecret || '')
          .update('')
          .digest('hex');
        await fetch(agentUrl, { method: 'DELETE', headers: { 'X-Aura-Signature': signature } });
      }
    } catch (err) {
      console.error('Agent PIN clear failed:', err);
    }

    // Считаем фактическое время сессии
    const endTime = new Date();
    const minutesPlayed = Math.ceil((endTime.getTime() - session.startTime.getTime()) / 60000);
    const ratePerMinute = session.machine.hourlyRate / 60;
    const toCharge = minutesPlayed * ratePerMinute;
    const merchantShare = Math.round(toCharge * 0.8); // 80% мерчанту
    const platformShare = Math.round(toCharge - merchantShare); // 20% платформе
    // Списываем с баланса игрока
    await prisma.user.update({
      where: { id: session.userId },
      data: { balance: { decrement: Math.round(toCharge) } },
    });
    await prisma.session.update({
      where: { id: sessionId },
      data: { endTime },
    });
    await prisma.machine.update({
      where: { id: session.machineId },
      data: { status: 'AVAILABLE' },
    });
    // Транзакции: списание у игрока и начисление мерчанту
    await prisma.transaction.create({
      data: {
        userId: session.userId,
        type: 'session',
        amount: -Math.round(toCharge),
        description: `Списание за сессию на ${session.machine.publicName}`,
      }
    });
    await prisma.transaction.create({
      data: {
        userId: session.machine.ownerId,
        type: 'payout',
        amount: merchantShare,
        description: `Доход за аренду: ${session.user.name || session.user.email}`,
      }
    });
    // Записываем комиссию платформы (можно назначить userId = null или отдельного служебного пользователя)
    // Комиссию удерживаем внутри платформы без отдельной записи или запишите на спец-пользователя
    return NextResponse.json({ message: 'Session ended', minutesPlayed, toCharge });
  } catch (error) {
    console.error('Failed to end session:', error);
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
  }
}