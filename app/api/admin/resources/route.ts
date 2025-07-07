// src/app/api/admin/resources/route.ts

import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// --- Функция для получения списка всех ресурсов ---
export async function GET() {
  // 1. Проверяем, что запрос делает администратор
  const session = await auth();
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Неавторизован", { status: 401 });
  }

  try {
    // 2. Получаем все ресурсы из базы данных, сортируем по дате создания
    const resources = await prisma.computeResource.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // 3. Отправляем клиенту в формате JSON
    return NextResponse.json(resources);
  } catch (error) {
    console.error("GET_RESOURCES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// --- Функция для добавления нового ресурса ---
export async function POST(request: Request) {
  // 1. Проверяем, что запрос делает администратор
  const session = await auth();
  // @ts-ignore
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Неавторизован", { status: 401 });
  }
  
  try {
    // 2. Получаем данные из тела запроса
    const body = await request.json();
    const { name, type, tier, ipAddress, hourlyRate } = body;

    // 3. Преобразуем цену в число и проверяем все данные
    const rateAsNumber = parseFloat(hourlyRate);
    if (!name || !type || !tier || !ipAddress || isNaN(rateAsNumber) || rateAsNumber <= 0) {
        return new NextResponse("Неверные данные. Все поля обязательны.", { status: 400 });
    }

    // 4. Создаем новый ресурс в базе данных
    const newResource = await prisma.computeResource.create({
      data: {
        name,
        type,
        tier,
        ipAddress,
        hourlyRate: rateAsNumber, // Сохраняем цену в тенге
      },
    });

    // 5. Отправляем созданный ресурс обратно клиенту
    return NextResponse.json(newResource);

  } catch (error) {
    console.error("CREATE_RESOURCE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}