import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const DEBUG_MODE = true;
const BLACKLIST = ["bypass.city"];
let checkpoint = 0;
let KEY = '';

function generateTimestampHash(): string {
  const timestamp = Date.now().toString();
  return crypto.createHash('sha256').update(timestamp).digest('hex');
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  const referer = req.headers.referer || '';
  const now = Date.now();
  const session = req.cookies || {};

  // Check if the referer is blacklisted
  if (
    (referer && !referer.includes("linkvertise.com")) ||
    (referer && referer.includes("bypass.city"))
  ) {
    res.status(403).send("phuck u");
    return;
  }

  // Check if the checkpoint is set
  if (checkpoint !== 0) {
    res.status(403).send("phuck u");
    return;
  }

  checkpoint = 1;

  // If in debug mode, reset the checkpoint
  if (DEBUG_MODE) {
    checkpoint = 0;
  }

  // Generate or retrieve the key
  if (!session.key || now > session.keyExpiration) {
    session.key = generateTimestampHash();
    session.keyExpiration = now + ONE_DAY_IN_MS; // Key TTL of 24 hours
  }

  KEY = session.key;
  res.setHeader('Set-Cookie', `key=${session.key}; Max-Age=${ONE_DAY_IN_MS}; HttpOnly, Secure`);
  res.status(200).send(KEY);
};
