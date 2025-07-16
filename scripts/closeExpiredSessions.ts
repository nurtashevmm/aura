import prisma from '@/lib/prisma';

async function closeExpiredSessions() {
  const now = new Date();
  // Считаем сессии, которые длятся больше 1 часа (3600 сек)
  const expired = await prisma.session.findMany({
    where: {
      endTime: null,
      startTime: { lt: new Date(now.getTime() - 60 * 60 * 1000) },
    },
    include: { machine: true },
  });
  for (const session of expired) {
    await prisma.session.update({
      where: { id: session.id },
      data: { endTime: now },
    });
    await prisma.machine.update({
      where: { id: session.machineId },
      data: { status: 'AVAILABLE' },
    });
    console.log(`Session ${session.id} closed automatically.`);
  }
  if (expired.length === 0) {
    console.log('No expired sessions found.');
  }
}

closeExpiredSessions().then(() => process.exit(0));
