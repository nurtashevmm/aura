// src/app/api/admin/users/route.ts
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Неавторизован", { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET_USERS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}