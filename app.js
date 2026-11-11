const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/users', (req, res) => {
    res.status(200).json([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
    ]);
});

module.exports = app;