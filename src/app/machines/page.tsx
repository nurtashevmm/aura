import prisma from '@/lib/prisma';
import MachineBrowser from '@/components/MachineBrowser';

// Server component that fetches all machines and renders the MachineBrowser client component
export default async function MachinesPage() {
  // Only machines that прошли модерацию отображаем
  const machines = await prisma.machine.findMany({
    where: { moderationStatus: 'AVAILABLE' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Доступные машины</h1>
      {/* @ts-expect-error Async Server Component passes data to client component */}
      <MachineBrowser machines={machines} />
    </div>
  );
}
