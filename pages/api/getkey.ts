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
  const referer = req.headers.referer
  console.log(req.headers.get("referer"));
  const now = Date.now();
  const cookies = req.cookies;

  // Check if the referer is blacklisted
  if (referer == "undefined" || referer && !referer.includes("linkvertise.com") || referer && referer.includes("bypass.city")) {
    console.log(referer);
    res.status(403).send("phuck u");
  }

  // Check if the checkpoint is set
  if (checkpoint !== 0) {
    console.log(referer);
    res.status(403).send("phuck u");
  }

  checkpoint = 1;

  // If in debug mode, reset the checkpoint
  if (DEBUG_MODE) {
    checkpoint = 0;
  }
  console.log(referer);
  // Generate or retrieve the key
  const keyExpiration = cookies.keyExpiration ? parseInt(cookies.keyExpiration, 10) : 0;
  if (!cookies.key || now > keyExpiration) {
    const newKey = generateTimestampHash();
    const newExpiration = now + ONE_DAY_IN_MS;
    res.setHeader('Set-Cookie', [
      `key=${newKey}; Max-Age=${ONE_DAY_IN_MS}; HttpOnly; Secure`,
      `keyExpiration=${newExpiration.toString()}; Max-Age=${ONE_DAY_IN_MS}; HttpOnly; Secure`
    ]);
    KEY = newKey;
  } else {
    KEY = cookies.key;
  }

  res.status(200).send(KEY);
};
