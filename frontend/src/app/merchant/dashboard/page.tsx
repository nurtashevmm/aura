import { StatsSummary } from '@/components/stats';
import { ROIcalculator } from '@/components/roi';

export default function MerchantDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Merchant Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Session Statistics</h2>
          <StatsSummary />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">ROI Calculator</h2>
          <ROIcalculator />
        </div>
      </div>
    </div>
  );
}
