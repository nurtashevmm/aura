import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH /api/machines/[id]/moderate - модерация машины
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { status, comment } = await req.json();
  const machine = await prisma.machine.update({
    where: { id: params.id },
    data: {
      moderationStatus: status,
      moderationComment: comment,
    },
  });
  return NextResponse.json(machine);
}
