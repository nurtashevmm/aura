import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Game } from '@prisma/client';

// Define the type for a machine with just the hourly rate
type MachineWithRate = {
  hourlyRate: number;
};

// Define the type for a game including its machines
type GameWithMachines = Game & {
  machines: MachineWithRate[];
};

// GET /api/games - список игр
export async function GET() {
  try {
    const gamesWithMachines: GameWithMachines[] = await prisma.game.findMany({
      include: {
        machines: {
          where: { moderationStatus: 'AVAILABLE' }, // Corrected enum value
          select: {
            hourlyRate: true,
          },
        },
      },
    });

    const games = gamesWithMachines.map(game => {
      const minPrice = game.machines.length > 0
        ? Math.min(...game.machines.map((m: MachineWithRate) => m.hourlyRate))
        : 0;
      
      const { ...gameData } = game;

      return {
        ...gameData,
        minPrice,
      };
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error('Failed to fetch games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

// POST /api/games - создать игру
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const game = await prisma.game.create({ data });
    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('Failed to create game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
