import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
  // Rate limit: 5 запросов на IP в 1 минуту
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (rateLimit({ key: `start:${ip}`, limit: 5, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Слишком много попыток. Попробуйте позже.' }, { status: 429 });
  }
  try {
    const { machineId } = await req.json();
    // Получаем текущего пользователя
    const session = await getServerSession(authOptions);
    let user = null;
    if (session && session.user?.id) {
      user = await prisma.user.findUnique({ where: { id: session.user.id } });
    }
    // тестовый режим: разрешаем гостевые сессии без регистрации
    if (!user) {
      user = await prisma.user.findFirst(); // берём любого игрока, чтобы соблюсти foreign key
    }
    if (!user) {
      return NextResponse.json({ error: 'No user found in test mode' }, { status: 500 });
    }
    const machine = await prisma.machine.findUnique({ where: { id: machineId } });
    if (!user || !machine || machine.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Machine not available' }, { status: 409 });
    }
    // В тестовом режиме пропускаем проверку баланса
    // Считаем максимальное время, которое игрок может провести на сервере
    const maxMinutes = Math.floor(user.balance / (machine.hourlyRate / 60));
    // --- Aura Agent pin generation ---
    const ttlSeconds = Math.min(maxMinutes * 60, 30 * 60) || 900; // 15-мин по умолчанию
    let pin = '111111';
    if (process.env.NODE_ENV === 'production') {
      // генерируем pin через локальный агент мерчанта
      const body = JSON.stringify({ sessionId: `${Date.now()}-${Math.random()}`.replace(/\D/g,'') , ttl: ttlSeconds });
      const hmac = await import('crypto').then(c=>c.createHmac('sha256', (machine as any).agentSecret).update(body).digest('hex'));
      const agentUrl = `http://${machine.tailscaleIp}:8800/session`;
      const resp = await fetch(agentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Aura-Signature': hmac },
        body,
      });
      if (!resp.ok) {
        console.error('Agent error', await resp.text());
        return NextResponse.json({ error: 'Failed to generate pin' }, { status: 502 });
      }
      const agentData = await resp.json();
      pin = agentData.pin;
    }
    // В режиме разработки пропустим сохранение в базу и сразу вернём ссылку
    if (process.env.NODE_ENV !== 'production') {
      const moonlightLink = `moonlight://connect?host=${machine.tailscaleIp}&token=${pin}`;
      return NextResponse.json({ sessionId: 'dev-session', moonlightLink, expiresIn: ttlSeconds, maxMinutes });
    }
    // Создание сессии
    const sessionDb = await prisma.session.create({
      data: {
        machine: { connect: { id: machineId } },
        user: { connect: { id: user.id } },
        pin,
        pinExpiresAt: new Date(Date.now() + ttlSeconds * 1000),
        tokenExpiresAt: new Date(Date.now() + ttlSeconds * 1000),
        maxMinutes,
        lastHeartbeat: new Date(),
      },
      include: { machine: true },
    });
    await prisma.machine.update({
      where: { id: machineId },
      data: { status: 'BUSY' },
    });
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'START_SESSION',
        details: `machineId=${machineId}`,
        ip,
      }
    });
    const moonlightLink = `moonlight://connect?host=${machine.tailscaleIp}&pin=${pin}`;
    return NextResponse.json({
      sessionId: sessionDb.id,
      moonlightLink,
      expiresIn: ttlSeconds,
      maxMinutes,
    });
  } catch (error) {
    console.error('Failed to start session:', error);
    await prisma.auditLog.create({
      data: {
        action: 'START_SESSION_ERROR',
        details: String(error),
        ip,
      }
    });
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
  }
}