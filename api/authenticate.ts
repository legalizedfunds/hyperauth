import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
let KEY = '';

function generateTimestampHash(): string {
  const timestamp = Date.now().toString();
  return crypto.createHash('sha256').update(timestamp).digest('hex');
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = req.cookies || {};
  const hash = req.query.hash as string;

  // Parse the expiration time from cookies
  const keyExpiration = cookies.keyExpiration ? parseInt(cookies.keyExpiration, 10) : 0;

  if (hash == KEY && Date.now() < keyExpiration) {
    res.status(200).send("Authentication successful");
    // Optionally, reset the key after successful authentication
    const newKey = generateTimestampHash();
    const newExpiration = Date.now() + ONE_DAY_IN_MS;
    res.setHeader('Set-Cookie', [
      `key=${newKey}; Max-Age=${ONE_DAY_IN_MS}; HttpOnly; Secure`,
      `keyExpiration=${newExpiration.toString()}; Max-Age=${ONE_DAY_IN_MS}; HttpOnly; Secure`
    ]);
  } else {
    res.status(403).send("Authentication failed");
  }
};
