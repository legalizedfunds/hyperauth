import { Request, Response } from 'express';
import session from 'express-session';
import crypto from 'crypto';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Session middleware
export const config = {
  api: {
    bodyParser: false,
  },
};

// Middleware to ensure key existence and validity
export default async (req: Request, res: Response) => {
  const now = Date.now();
  const keyExpiration = req.session.keyExpiration || 0;

  if (!req.session.key || now > keyExpiration) {
    req.session.key = generateTimestampHash();
    req.session.keyExpiration = now + ONE_DAY_IN_MS; // Key TTL of 24 hours
  }

  const referer = req.get('Referer');
  console.log(referer);
  const ipAddress = req.ip;
  console.log(`Client IP Address: ${ipAddress}`);

  // Check if the referer is blacklisted
  if ((referer && !referer.includes('linkvertise.com')) || (referer && referer.includes('bypass.city'))) {
    return res.status(403).send('Forbidden');
  }

  // Get the key from the session
  const KEY = req.session.key;

  // Send the key if it exists, otherwise send an error message
  if (KEY) {
    res.send(KEY);
  } else {
    res.status(500).send('Internal Server Error');
  }
};

// Function to generate a hash of the current timestamp
function generateTimestampHash(): string {
  const timestamp = Date.now().toString();
  return crypto.createHash('sha256').update(timestamp).digest('hex');
}
