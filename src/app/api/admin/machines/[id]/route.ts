import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const machine = await prisma.machine.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(machine);
  } catch (error) {
    console.error(`Failed to update machine ${params.id}:`, error);
    return NextResponse.json({ error: `Failed to update machine ${params.id}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.machine.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Machine deleted' });
  } catch (error) {
    console.error(`Failed to delete machine ${params.id}:`, error);
    return NextResponse.json({ error: `Failed to delete machine ${params.id}` }, { status: 500 });
  }
}