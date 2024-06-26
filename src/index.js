const express = require('express');
const app = express();
const PORT = 3000;


const BLACKLIST = ['bypass.city', 'bypass', 'undefined'];
const ALLOWLIST = ['linkvertise.com'];

app.get('/', (req, res) => {
    res.status(200).json("key: 3000")
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
