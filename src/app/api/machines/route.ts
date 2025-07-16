import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { generateMachineId } from '@/lib/generateMachineId';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url!);
    const gameId = url.searchParams.get('game');
    const status = url.searchParams.get('status');
    const maxPrice = url.searchParams.get('maxPrice');
    const where: Record<string, unknown> = {};
    if (gameId) {
      where.games = { some: { id: gameId } };
    }
    if (status) {
      where.status = status;
    }
    if (maxPrice) {
      where.hourlyRate = { lte: Number(maxPrice) };
    }
    const machines = await prisma.machine.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        publicName: true,
        cpu: true,
        gpu: true,
        ram: true,
        hourlyRate: true,
        status: true,
        moderationStatus: true,
        moderationComment: true,
        screenshotUrl: true,
        tailscaleIp: true,
        sunshinePin: true,
        ownerId: true,
        games: { select: { id: true, title: true } },
      }
    });
    return NextResponse.json(machines);
  } catch (error) {
    console.error('Failed to fetch machines:', error);
    return NextResponse.json({ error: 'Failed to fetch machines' }, { status: 500 });
  }
}

import { MachineCreateSchema } from '@/lib/zod/machine';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.json();
    // Валидация через Zod
    const parse = MachineCreateSchema.safeParse(data);
    if (!parse.success) {
      return NextResponse.json({ error: 'Validation error', details: parse.error.errors }, { status: 400 });
    }
    // Генерируем короткий уникальный publicName
    let publicName;
    let exists = true;
    // Проверяем уникальность
    while (exists) {
      publicName = generateMachineId(6);
      exists = await prisma.machine.findFirst({ where: { publicName } }) !== null;
    }
    const machine = await prisma.machine.create({
      data: {
        ...data,
        publicName,
        ownerId: session.user.id,
        games: { connect: (data.games || []).map((id: string) => ({ id })) },
        moderationStatus: 'PENDING_MODERATION',
      },
    });
    return NextResponse.json(machine);
  } catch (error) {
    console.error('Failed to create machine:', error);
    return NextResponse.json({ error: 'Failed to create machine' }, { status: 500 });
  }
}