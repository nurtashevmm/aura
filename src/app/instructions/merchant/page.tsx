import React from 'react';
import ContentBlockEditor from '@/components/ContentBlockEditor';

export default function MerchantInstructionsPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Инструкция для мерчанта</h1>
      <ContentBlockEditor blockId="instructions_merchant" />
    </div>
  );
}
