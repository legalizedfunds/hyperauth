import express from 'express';
import morgan from 'morgan';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { IpFilter } from 'express-ipfilter';
import { generateTimestampHash } from './utils/local-ip';
import { getKeyHandler } from './api/getkey';
import { authenticateHandler } from './api/authenticate';

const app = express();
const PORT = process.env.PORT || 3000;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const DEBUG_MODE = true;

// Middleware to log all requests
app.use(morgan('combined'));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// Session middleware
app.use(
  session({
    secret: 'your-secret-key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: ONE_DAY_IN_MS, // Adjust maxAge as needed
      trustProxy: true,
    },
  })
);

// List of allowed IPs
const allowedIps: string[] = ['']; // Add allowed IPs here

// IP filter middleware
app.use(IpFilter(allowedIps, { mode: 'deny', log: true }));

app.set('trust proxy', 1);

// Middleware to ensure key existence and validity
app.use((req: any, res, next) => {
  const now = Date.now();
  const keyExpiration = req.session.keyExpiration || 0;

  if (!req.session.key || now > keyExpiration) {
    req.session.key = generateTimestampHash();
    req.session.keyExpiration = now + ONE_DAY_IN_MS; // Key TTL of 24 hours
  }
  next();
});

// Routes
app.get('/api/getkey', getKeyHandler);
app.get('/api/authenticate', authenticateHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
