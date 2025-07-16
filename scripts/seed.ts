import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Создаём тестового пользователя-мерчанта
  const merchant = await prisma.user.create({
    data: {
      name: 'Merchant',
      email: 'merchant@example.com',
      password: 'password',
      role: 'MERCHANT',
    },
  })

  await prisma.machine.create({
    data: {
      name: 'Test Machine',
      publicName: 'Aura Test Machine',
      cpu: 'Intel Core i9-13900K',
      gpu: 'RTX 4090',
      ram: '32GB DDR5',
      ipAddress: '192.168.1.100',
      sunshine_username: 'sunshine_admin',
      sunshine_password: 'password',
      status: 'AVAILABLE',
      moderationStatus: 'AVAILABLE',
      hourlyRate: 100,
      type: 'desktop',
      tier: 'premium',
      os: 'Windows 11',
      ownerId: merchant.id,
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })