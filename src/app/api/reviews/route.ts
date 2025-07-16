import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET /api/reviews - список отзывов
export async function GET() {
  const reviews = await prisma.review.findMany({
    include: { user: true, machine: true }
  });
  return NextResponse.json(reviews);
}

import { ReviewCreateSchema } from '@/lib/zod/review';

// POST /api/reviews - создать отзыв
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if(!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await req.json();
  const parse = ReviewCreateSchema.safeParse(data);
  if (!parse.success) {
    return NextResponse.json({ error: 'Validation error', details: parse.error.errors }, { status: 400 });
  }
  const review = await prisma.review.create({ data: { ...parse.data, userId: session.user.id } });
  return NextResponse.json(review);
}
