import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const now = new Date()
  // 5 минут без heartbeat — считаем сессию неактивной
  const timeoutMs = 5 * 60 * 1000
  const expiredSessions = await prisma.session.findMany({
    where: {
      endTime: null,
      lastHeartbeat: {
        lt: new Date(now.getTime() - timeoutMs)
      }
    }
  })
  for (const session of expiredSessions) {
    await prisma.session.update({
      where: { id: session.id },
      data: { endTime: now }
    })
    await prisma.machine.update({
      where: { id: session.machineId },
      data: { status: 'AVAILABLE' }
    })
    console.log(`Session ${session.id} closed due to inactivity`)
  }
}

main().finally(() => prisma.$disconnect())
