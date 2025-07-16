import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// PATCH /api/admin/users/[id]/balance { amount: number }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { amount } = await req.json();
  if (typeof amount !== 'number') {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { id: params.id },
    data: { balance: { increment: amount } },
    select: { id: true, balance: true }
  });
  return NextResponse.json(user);
}
