import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Test route hit:', {
    method: req.method,
    path: req.url,
    headers: req.headers
  });
  
  return res.status(200).json({ message: 'Test route working' });
} 