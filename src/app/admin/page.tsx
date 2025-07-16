import AdminDashboard from '@/components/admin/AdminDashboard';
import prisma from '@/lib/prisma';

async function getMachines() {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return machines;
  } catch (error) {
    throw error;
  }
}

export default async function AdminPage() {
  const machines = await getMachines();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">Панель Администратора</h1>
      <AdminDashboard initialMachines={machines} />
    </div>
  );
}