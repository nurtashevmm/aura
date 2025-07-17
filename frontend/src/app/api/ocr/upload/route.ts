import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Forward to backend OCR service
    const backendResponse = await fetch(
      'http://localhost:8000/api/ocr/upload',
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!backendResponse.ok) {
      throw new Error('Backend OCR service error');
    }
    
    const result = await backendResponse.json();
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
