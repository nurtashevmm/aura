'use client';
import { useState } from 'react';
import { processKaspiPayment } from '@/lib/api';

export default function BalanceTopup() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/payment/verify-cheque', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      setStatus(result.status);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Top Up Balance</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Step 1: Pay via Kaspi</h2>
          <a 
            href="https://pay.kaspi.kz/pay/abc123" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Open Kaspi Pay
          </a>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Step 2: Upload Receipt</h2>
          <input 
            type="file" 
            accept="image/*,.pdf" 
            onChange={handleFileChange}
            className="mb-2"
          />
          {preview && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Receipt Preview:</h3>
              <img src={preview} alt="Receipt preview" className="max-w-xs border rounded" />
            </div>
          )}
          <button 
            onClick={handleSubmit}
            disabled={!file}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Verify Payment
          </button>
        </div>
        
        {status && (
          <div className={`p-4 rounded ${status === 'pending_verification' ? 'bg-yellow-100' : 'bg-green-100'}`}>
            Status: {status}
          </div>
        )}
      </div>
    </div>
  );
}
