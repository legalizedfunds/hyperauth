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

  const { hash } = req.query;
  const KEY = req.session.key;

  // Validate hash and session key
  if (hash === KEY && Date.now() < req.session.keyExpiration) {
    res.send('Authentication successful');
    // Optionally, reset the key after successful authentication
    req.session.key = generateTimestampHash();
    req.session.keyExpiration = Date.now() + ONE_DAY_IN_MS;
  } else {
    res.status(403).send('Forbidden');
  }
};

// Function to generate a hash of the current timestamp
function generateTimestampHash(): string {
  const timestamp = Date.now().toString();
  return crypto.createHash('sha256').update(timestamp).digest('hex');
}
