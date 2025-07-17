import { useState, useRef } from 'react';
import Image from 'next/image';
import type { OCRResponse, KaspiReceiptData } from '@/types/ocr';

export default function ReceiptUpload() {
  const [file, setFile] = useState<File|null>(null);
  const [preview, setPreview] = useState<string|null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<KaspiReceiptData|null>(null);
  const [error, setError] = useState<string|null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setResult(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Пожалуйста, выберите файл');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/ocr/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Ошибка сервера');
      }
      
      const data: OCRResponse = await response.json();
      setResult(data.receiptData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="flex flex-col items-center">
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 mb-2"
        >
          Выберите чек
        </button>
        
        {preview && (
          <div className="mt-2 border rounded-lg overflow-hidden">
            <Image 
              src={preview} 
              alt="Предпросмотр чека"
              width={300}
              height={400}
              objectFit="contain"
            />
          </div>
        )}
      </div>
      
      {file && (
        <button
          onClick={handleUpload}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Проверяем чек...' : 'Отправить на проверку'}
        </button>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-bold text-lg mb-2">Результат проверки</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Сумма:</span> {result.amount} ₸</p>
            <p><span className="font-medium">Номер чека:</span> {result.receiptNumber}</p>
            <p><span className="font-medium">Дата:</span> {result.date}</p>
            <p><span className="font-medium">Статус:</span> {result.verified ? '✅ Подтвержден' : '❌ Ошибка'}</p>
          </div>
        </div>
      )}
    </div>
  );
}