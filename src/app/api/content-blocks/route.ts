import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/content-blocks - список контент-блоков
export async function GET() {
  const blocks = await prisma.contentBlock.findMany();
  return NextResponse.json(blocks);
}

// POST /api/content-blocks - создать/обновить блок
export async function POST(req: NextRequest) {
  const data = await req.json();
  const block = await prisma.contentBlock.upsert({
    where: { blockId: data.blockId },
    update: { content: data.content },
    create: { blockId: data.blockId, content: data.content },
  });
  return NextResponse.json(block);
}
