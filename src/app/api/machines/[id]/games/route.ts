import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/machines/:id/games – список игр для машины
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const machineId = params.id;
  if (!machineId) {
    return NextResponse.json({ error: 'Machine id is required' }, { status: 400 });
  }
  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    select: {
      games: {
        select: { id: true, title: true },
        orderBy: { title: 'asc' },
      },
    },
  });
  if (!machine) {
    return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
  }
  return NextResponse.json(machine.games);
}
