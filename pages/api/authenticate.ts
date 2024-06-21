import { Request, Response } from 'express';
import { generateTimestampHash } from '../utils/local-ip';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const authenticateHandler = (req: Request, res: Response) => {
  const hash = req.query.hash as string | undefined;
  if (!hash || !req.session.key || Date.now() >= req.session.keyExpiration) {
    return res.status(403).send('Forbidden');
  }

  if (hash === req.session.key) {
    // Authentication successful
    res.send('Authentication successful');
    // Optionally, reset the key after successful authentication
    req.session.key = generateTimestampHash();
    req.session.keyExpiration = Date.now() + ONE_DAY_IN_MS;
  } else {
    // Authentication failed
    res.status(403).send('Authentication failed');
  }
};
