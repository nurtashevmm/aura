import React, { useRef, useState } from 'react';
import Image from 'next/image';

export default function ImageUploadField({
  value,
  onChange,
  label = 'Изображение',
  disabled = false,
}: {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    onChange(data.url);
    setUploading(false);
  };

  return (
    <div className="mb-4">
      <label className="block font-semibold mb-1">{label}</label>
      {value && (
        <Image src={value} alt="preview" width={128} height={128} className="w-32 h-32 object-cover rounded mb-2 border" />
      )}
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="block"
      />
      {uploading && <span className="text-xs text-zinc-400 ml-2">Загрузка...</span>}
    </div>
  );
}
