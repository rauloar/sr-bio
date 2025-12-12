// Node.js backend for ZKTeco management (Express + jmrashed/zkteco)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { ZKLib } = require('zkteco');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// SQLite DB setup
const db = new sqlite3.Database('../db/sr-bio.db', (err) => {
  if (err) {
    console.error('Failed to connect to SQLite DB:', err.message);
  } else {
    console.log('Connected to SQLite DB');
  }
});

// Test connection to ZKTeco device
app.post('/api/devices/test', async (req, res) => {
  const { ip, port } = req.body;
  if (!ip || !port) return res.status(400).json({ success: false, message: 'IP y puerto requeridos' });
  try {
    const zk = new ZKLib(ip, port, 10000, 4000);
    await zk.createSocket();
    const info = await zk.getInfo();
    await zk.disconnect();
    res.json({ success: true, data: info });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// TODO: Add CRUD endpoints for devices, users, logs

app.listen(PORT, () => {
  console.log(`Node.js ZKTeco backend running on port ${PORT}`);
});
