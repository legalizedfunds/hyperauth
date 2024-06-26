const express = require('express');
const app = express();
const PORT = 3000;


const BLACKLIST = ['bypass.city', 'bypass', 'undefined'];
const ALLOWLIST = ['linkvertise.com'];

app.get('/', (req, res) => {
    res.send('henlo')
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
