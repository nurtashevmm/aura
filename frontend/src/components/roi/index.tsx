'use client';

import { useState } from 'react';

export function ROIcalculator() {
  const [hours, setHours] = useState(8);
  const [rate, setRate] = useState(0.5);
  
  const calculateROI = () => {
    return (hours * rate * 30).toFixed(2); // Monthly estimate
  };

  return (
    <div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Daily Usage (hours)
          </label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hourly Rate ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="p-4 bg-blue-50 rounded">
          <p className="text-sm text-gray-600">Estimated Monthly Revenue</p>
          <p className="text-2xl font-bold text-blue-600">${calculateROI()}</p>
        </div>
      </div>
    </div>
  );
}
