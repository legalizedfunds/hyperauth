const express = require('express');
const app = express();
const PORT = 3000;


const BLACKLIST = ['bypass.city', 'bypass', 'undefined'];
const ALLOWLIST = ['linkvertise.com'];

app.use((req, res, next) => {
    const ref = req.get('referer');

    if (ref && ref[BLACKLIST]) {
        res.send("phuck u");
    } else (ref && !ref[BLACKLIST] && ref && ref[ALLOWLIST]); {
        res.send("welcome");
    }
})

app.get('/', (req, res) => {
    res.send('hewwo')
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
