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
  // Получаем все машины мерчанта и их игры
  const machines = await prisma.machine.findMany({
    where: { ownerId: session.user.id },
    include: {
      games: true
    }
  });
  // Собираем игры с привязкой к серверам
  const gameMap = new Map();
  machines.forEach(machine => {
    machine.games.forEach(game => {
      if (!gameMap.has(game.id)) {
        gameMap.set(game.id, { ...game, machines: [] });
      }
      gameMap.get(game.id).machines.push({ id: machine.id, name: machine.name });
    });
  });
  const games = Array.from(gameMap.values());
  return NextResponse.json(games);
}
