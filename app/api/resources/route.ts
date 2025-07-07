// src/app/api/resources/route.ts
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Неавторизован", { status: 401 });
  }

  try {
    const resources = await prisma.computeResource.findMany({
      where: {
        status: 'AVAILABLE' // Отдаем только доступные машины
      },
      orderBy: { hourlyRate: 'asc' }
    });
    return NextResponse.json(resources);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}