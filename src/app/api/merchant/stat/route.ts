import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET /api/merchant/stat — статистика по серверам мерчанта
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({}, { status: 200 });
  }
  // Получаем все машины мерчанта
  const machines = await prisma.machine.findMany({
    where: { ownerId: session.user.id },
    select: { id: true }
  });
  const stats: Record<string, { sessionsCount: number; totalIncome: number; totalMinutes: number }> = {};
  for (const m of machines) {
    const sessions = await prisma.session.findMany({
      where: { machineId: m.id, endTime: { not: null } },
      select: { startTime: true, endTime: true, machine: { select: { hourlyRate: true } } }
    });
    stats[m.id] = {
      sessionsCount: sessions.length,
      totalIncome: sessions.reduce((sum, s) => sum + (s.machine.hourlyRate || 0), 0),
      totalMinutes: sessions.reduce((sum, s) => s.endTime ? sum + Math.round((s.endTime.getTime() - s.startTime.getTime())/60000) : sum, 0),
    };
  }
  return NextResponse.json(stats);
}
