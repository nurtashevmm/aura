// src/app/api/admin/update-balance/route.ts
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();

  // @ts-ignore
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Неавторизован", { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, amount } = body;

    const amountAsNumber = parseFloat(amount); // Убедимся, что это число

    if (!userId || isNaN(amountAsNumber) || amountAsNumber <= 0) {
      return new NextResponse("Неверные данные", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amountAsNumber, // Просто увеличиваем на введенную сумму в тенге
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("UPDATE_BALANCE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}