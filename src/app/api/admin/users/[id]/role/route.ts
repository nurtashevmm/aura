import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// PATCH /api/admin/users/[id]/role { role: 'PLAYER' | 'MERCHANT' | 'ADMIN' }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { role } = await req.json();
  if (!['PLAYER', 'MERCHANT', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role },
    select: { id: true, role: true }
  });
  return NextResponse.json(user);
}
