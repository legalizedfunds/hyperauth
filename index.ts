const express = require("express");
const session = require("express-session");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { IpFilter, IpDeniedError } = require("express-ipfilter");
const crypto = require("crypto");
const app = express();
const PORT = 3000;

// Middleware to log all requests
app.use(morgan("combined"));

// Rate limiting middleware
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

// Session middleware
app.use(
	session({
		secret: "your-secret-key", // Replace with a strong secret key
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false, maxAge: 300000 }, // Adjust maxAge as needed
	}),
);

// List of allowed IPs
const allowedIps = [
	"::1",
	"127.0.0.1",
	"::ffff:172.31.196.50",
	"::ffff:172.31.196.13",
]; // Add allowed IPs here

// IP filter middleware
app.use(IpFilter(allowedIps, { mode: "allow", log: false }));

// Function to generate a hash of the current timestamp
function generateTimestampHash() {
	const timestamp = Date.now().toString();
	return crypto.createHash("sha256").update(timestamp).digest("hex");
}

// Middleware to check referrer and store key in session
app.use((req, res, next) => {
	const referrer = req.get("referrer");
	if (referrer && referrer.includes("linkvertise.com") && !req.session.key) {
		const newHash = generateTimestampHash();
		req.session.key = newHash;
		req.session.keyExpiration = Date.now() + 300000; // Key TTL in milliseconds (e.g., 5 minutes)
	}
	next();
});

// Route to serve the current key
app.get("/api/getkey", (req, res) => {
	const referrer = req.get("referrer");
	if (referrer && referrer.includes("linkvertise.com")) {
		if (!req.session.key || Date.now() > req.session.keyExpiration) {
			const newHash = generateTimestampHash();
			req.session.key = newHash;
			req.session.keyExpiration = Date.now() + 300000; // Key TTL in milliseconds (e.g., 5 minutes)
		}
		res.send(req.session.key);
	}
	res.send("phuck u");
});

// Route to authenticate the hash
app.post("/api/authenticate", (req, res) => {
	let hash = req.query.hash;
	if (hash == req.session.key && Date.now() <= req.session.keyExpiration) {
		res.send("Authentication successful");
		// Optionally, reset the key after successful authentication
		req.session.key = null;
		req.session.keyExpiration = null;
	} else {
		res.send("Authentication failed");
	}
});

// Root route
app.get("/", (req, res) => {
	res.send("Hello, this is your Express server!");
});

// Error handler for IP denied errors
app.use((err, req, res, next) => {
	if (err instanceof IpDeniedError) {
		res.status(403).send("Forbidden");
	} else {
		next(err);
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
