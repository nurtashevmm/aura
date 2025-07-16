import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await hash('admin123', 12)
  const merchantPassword = await hash('merchant123', 12)
  const userPassword = await hash('user123', 12)

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      name: 'Admin'
    }
  })

  await prisma.user.upsert({
    where: { email: 'merchant@example.com' },
    update: {},
    create: {
      email: 'merchant@example.com',
      password: merchantPassword,
      role: 'MERCHANT',
      name: 'Merchant'
    }
  })

  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      role: 'PLAYER',
      name: 'User'
    }
  })
  // --- Добавляем демо-игры ---
  const game1 = await prisma.game.upsert({
    where: { title: 'Cyberpunk 2077' },
    update: {},
    create: {
      title: 'Cyberpunk 2077',
      genre: 'RPG, Экшен',
      coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg',
      minPrice: 1200,
    },
  });
  const game2 = await prisma.game.upsert({
    where: { title: 'CS:GO' },
    update: {},
    create: {
      title: 'CS:GO',
      genre: 'Шутер',
      coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg',
      minPrice: 500,
    },
  });
  const game3 = await prisma.game.upsert({
    where: { title: 'FIFA 24' },
    update: {},
    create: {
      title: 'FIFA 24',
      genre: 'Спорт',
      coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/header.jpg',
      minPrice: 900,
    },
  });

  // --- Получаем мерчанта ---
  const merchant = await prisma.user.findUnique({ where: { email: 'merchant@example.com' } });

  // --- Добавляем машины ---
  await prisma.machine.createMany({
    data: [
      {
        name: 'rtx4090-01',
        publicName: 'RTX 4090 #1',
        cpu: 'Intel i9-13900K',
        gpu: 'NVIDIA RTX 4090',
        ram: '64GB',
        ipAddress: '10.0.0.101',
        sunshine_username: 'sunuser1',
        sunshine_password: 'pass1',
        status: 'AVAILABLE',
        moderationStatus: 'AVAILABLE',
        hourlyRate: 1200,
        type: 'PC',
        tier: 'Premium',
        os: 'Windows 11',
        ownerId: merchant?.id || '',
      },
      {
        name: 'ps5-03',
        publicName: 'PS5 #3',
        cpu: 'AMD Zen 2',
        gpu: 'Custom RDNA 2',
        ram: '16GB',
        ipAddress: '10.0.0.102',
        sunshine_username: 'sunuser2',
        sunshine_password: 'pass2',
        status: 'BUSY',
        moderationStatus: 'AVAILABLE',
        hourlyRate: 900,
        type: 'Console',
        tier: 'Standard',
        os: 'PlayStation OS',
        ownerId: merchant?.id || '',
      },
      {
        name: 'gtx1660-01',
        publicName: 'GTX 1660 Super',
        cpu: 'Intel i5-10400F',
        gpu: 'NVIDIA GTX 1660 Super',
        ram: '32GB',
        ipAddress: '10.0.0.103',
        sunshine_username: 'sunuser3',
        sunshine_password: 'pass3',
        status: 'AVAILABLE',
        moderationStatus: 'AVAILABLE',
        hourlyRate: 500,
        type: 'PC',
        tier: 'Basic',
        os: 'Windows 10',
        ownerId: merchant?.id || '',
      },
    ],
    skipDuplicates: true,
  });

  // --- Привязываем игры к машинам ---
  const m1 = await prisma.machine.findUnique({ where: { ipAddress: '10.0.0.101' } });
  const m2 = await prisma.machine.findUnique({ where: { ipAddress: '10.0.0.102' } });
  const m3 = await prisma.machine.findUnique({ where: { ipAddress: '10.0.0.103' } });

  if (m1) await prisma.machine.update({ where: { id: m1.id }, data: { games: { set: [{ id: game1.id }, { id: game2.id }] } } });
  if (m2) await prisma.machine.update({ where: { id: m2.id }, data: { games: { set: [{ id: game3.id }] } } });
  if (m3) await prisma.machine.update({ where: { id: m3.id }, data: { games: { set: [{ id: game2.id }] } } });
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
