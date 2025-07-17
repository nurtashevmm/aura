import { NextApiRequest, NextApiResponse } from 'next';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const backendResponse = await fetch(`${process.env.BACKEND_URL}/ocr/process`, {
      method: 'POST',
      body: buffer,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/octet-stream',
        'Content-Length': req.headers['content-length'] || buffer.length.toString()
      }
    });

    if (!backendResponse.ok) {
      throw new Error(await backendResponse.text());
    }

    return res.status(200).json(await backendResponse.json());
  } catch (error) {
    console.error('Receipt verification error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
