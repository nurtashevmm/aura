import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      balance: true,
      sessions: {
        where: { endTime: null },
        include: { machine: true }
      }
    }
  });
  return NextResponse.json(user);
}

import { hash } from 'bcryptjs';

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  interface UpdateUserData {
    name?: string;
    password?: string;
  }
  const updateData: UpdateUserData = {};
  if (body.name) updateData.name = body.name;
  if (body.password) updateData.password = await hash(body.password, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  });
  return NextResponse.json({ success: true });
}
