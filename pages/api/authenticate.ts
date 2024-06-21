import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
let KEY = '';

function generateTimestampHash(): string {
  const timestamp = Date.now().toString();
  return crypto.createHash('sha256').update(timestamp).digest('hex');
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  const session = req.cookies || {};
  const hash = req.query.hash as string;

  if (hash == KEY && Date.now() < (session.keyExpiration || 0)) {
    res.status(200).send("Authentication successful");
    // Optionally, reset the key after successful authentication
    session.key = generateTimestampHash();
    session.keyExpiration = Date.now() + ONE_DAY_IN_MS;
    res.setHeader('Set-Cookie', `key=${session.key}; Max-Age=${ONE_DAY_IN_MS}; HttpOnly, Secure`);
  } else {
    res.status(403).send("Authentication failed");
  }
};
