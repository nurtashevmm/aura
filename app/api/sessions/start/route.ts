// src/app/api/sessions/start/route.ts
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Неавторизован", { status: 401 });
  }

  try {
    const body = await request.json();
    const { resourceId } = body;

    // 1. Получаем данные о пользователе и ресурсе
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const resource = await prisma.computeResource.findUnique({ where: { id: resourceId } });

    if (!user || !resource) {
      return new NextResponse("Пользователь или ресурс не найден", { status: 404 });
    }

    // 2. Проверяем, свободна ли машина
    if (resource.status !== 'AVAILABLE') {
      return new NextResponse("Этот ресурс сейчас занят или недоступен", { status: 409 }); // 409 Conflict
    }

    // 3. Проверяем, достаточно ли денег на балансе (хотя бы на 1 час)
    if (user.balance < resource.hourlyRate) {
      return new NextResponse("Недостаточно средств на балансе", { status: 402 }); // 402 Payment Required
    }

    // 4. Используем ТРАНЗАКЦИЮ. Это гарантирует, что ОБА действия (смена статуса и создание сессии) выполнятся успешно, либо ни одно.
    const [updatedResource, newSession] = await prisma.$transaction([
      // Действие 1: Обновить статус машины на "BUSY"
      prisma.computeResource.update({
        where: { id: resourceId },
        data: { status: 'BUSY' },
      }),
      // Действие 2: Создать новую запись о сессии
      prisma.session.create({
        data: {
          userId: user.id,
          resourceId: resource.id,
          status: 'ACTIVE',
        },
      }),
    ]);

    // 5. Возвращаем пользователю данные для подключения
    return NextResponse.json({
      message: "Сессия успешно начата!",
      connectionInfo: {
        ipAddress: updatedResource.ipAddress,
        connectionPin: updatedResource.connectionPin,
      }
    });

  } catch (error) {
    console.error("START_SESSION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}