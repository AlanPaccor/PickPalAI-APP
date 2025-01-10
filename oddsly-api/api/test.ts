import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Test endpoint hit:', {
    method: req.method,
    path: req.url,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
  
  return res.status(200).json({ 
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
}