import { NextRequest, NextResponse } from 'next/server';
import { MachineStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // Фильтрация по цене и статусу
  const url = new URL(req.url!);
  const maxPrice = url.searchParams.get('maxPrice');
  const status = url.searchParams.get('status');

  interface MachineWhereClause {
    hourlyRate?: {
      lte: number;
    };
    status?: MachineStatus;
  }
  const where: MachineWhereClause = {};
  if (maxPrice) {
    where.hourlyRate = { lte: parseInt(maxPrice, 10) };
  }
  if (status && status !== 'any' && Object.values(MachineStatus).includes(status as MachineStatus)) {
    where.status = status as MachineStatus;
  }

  const machines = await prisma.machine.findMany({
    where,
    orderBy: { hourlyRate: 'asc' },
  });
  return NextResponse.json(machines);
}
