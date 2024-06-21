import { Request, Response } from 'express';
import { generateTimestampHash } from '../utils/local-ip';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const DEBUG_MODE = true;

let checkpoint = 0;
let KEY = '';

export const getKeyHandler = (req: Request, res: Response) => {
  const referer = req.get('Referer');
  console.log(referer);

  // Check if the referer is blacklisted
  if (
    (referer && !referer.includes('linkvertise.com')) ||
    (referer && referer.includes('bypass.city'))
  ) {
    return res.status(403).send('Forbidden');
  }

  // Check if the checkpoint is set
  if (checkpoint !== 0) {
    return res.status(403).send('Forbidden');
  }

  checkpoint = 1;

  // If in debug mode, reset the checkpoint
  if (DEBUG_MODE) {
    checkpoint = 0;
  }

  // Generate or retrieve the key (simulated for demo)
  KEY = generateTimestampHash();

  // Send the key if it exists, otherwise send an error message
  if (KEY) {
    return res.status(200).json({ key: KEY });
  } else {
    return res.status(500).send('Internal Server Error');
  }
};
