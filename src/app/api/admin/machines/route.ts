import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(machines);
  } catch (error) {
    console.error('Failed to fetch machines:', error);
    return NextResponse.json({ error: 'Failed to fetch machines' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    let ownerId = data.ownerId;
    // Если ownerId похож на email, ищем пользователя
    if (ownerId && ownerId.includes('@')) {
      const user = await prisma.user.findUnique({ where: { email: ownerId } });
      if (!user) {
        return NextResponse.json({ error: 'Пользователь с таким email не найден' }, { status: 400 });
      }
      ownerId = user.id;
    }
    const machine = await prisma.machine.create({ data: { ...data, ownerId } });
    return NextResponse.json(machine);
  } catch (error) {
    console.error('Failed to create machine:', error);
    return NextResponse.json({ error: 'Failed to create machine' }, { status: 500 });
  }
}