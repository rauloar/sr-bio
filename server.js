import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import ZKLib from 'node-zklib';
import net from 'net';
import sqlite3 from 'sqlite3';

// NOTA: Recuerda ejecutar 'npm install' para las dependencias

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// --- DATABASE SETUP (SQLite) ---
const db = new sqlite3.Database('./sr-bio.db', (err) => {
    if (err) console.error('Error opening database:', err.message);
    else console.log('[DB] Connected to SQLite database.');
});

// Inicializar Tablas
db.serialize(() => {
    // Tabla Dispositivos
    db.run(`CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        name TEXT,
        ip TEXT,
        port INTEGER,
        model TEXT,
        status TEXT,
        last_seen TEXT,
        mac TEXT,
        image TEXT
    )`);

    // Tabla Usuarios
    // user_id es el ID numérico del reloj (e.g. 1, 2)
    // card es el número de tarjeta RFID
    db.run(`CREATE TABLE IF NOT EXISTS users (
        uid INTEGER PRIMARY KEY AUTOINCREMENT,
        device_user_id TEXT, 
        name TEXT,
        role TEXT,
        password TEXT,
        card TEXT,
        device_id TEXT,
        FOREIGN KEY(device_id) REFERENCES devices(id)
    )`);

    // Tabla Logs
    db.run(`CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        device_id TEXT,
        timestamp TEXT,
        verify_type INTEGER,
        status INTEGER,
        UNIQUE(user_id, timestamp, device_id)
    )`);

    // Insertar dispositivo por defecto si no existe
    db.get("SELECT count(*) as count FROM devices", [], (err, row) => {
        if (row && row.count === 0) {
            console.log("[DB] Seeding default device...");
            db.run(`INSERT INTO devices (id, name, ip, port, model, status, last_seen, mac, image) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                    ['1', 'ZKTeco Entrada', '192.168.1.201', 4370, 'ZK Terminal', 'Offline', '-', '00:00:00:00:00:00', 'https://cdn-icons-png.flaticon.com/512/9638/9638162.png']);
        }
    });
});

// --- HELPERS DB ---
const getDevicesFromDB = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM devices", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(r => ({ ...r, lastSeen: r.last_seen })));
        });
    });
};

const getDeviceById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM devices WHERE id = ?", [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// --- BACKGROUND MONITOR SERVICE ---
const pingDevice = (host, port, timeout = 3000) => {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(timeout);
        socket.on('connect', () => { socket.destroy(); resolve(true); });
        socket.on('timeout', () => { socket.destroy(); resolve(false); });
        socket.on('error', () => { socket.destroy(); resolve(false); });
        socket.connect(port, host);
    });
};

const monitorDevices = async () => {
    try {
        const devices = await getDevicesFromDB();
        for (const device of devices) {
            const isOnline = await pingDevice(device.ip, device.port);
            const status = isOnline ? 'Online' : 'Offline';
            const lastSeen = isOnline ? new Date().toLocaleString() : device.last_seen;
            
            // Actualizar DB solo si cambia o para actualizar last_seen
            db.run("UPDATE devices SET status = ?, last_seen = ? WHERE id = ?", [status, lastSeen, device.id]);
        }
    } catch (e) {
        console.error("Error monitoring devices:", e);
    }
};

setInterval(monitorDevices, 30000);
monitorDevices();

// --- ZK CONNECTION HELPER ---
const withZkConnection = async (deviceConfig, actionCallback) => {
    console.log(`[SERVER] Conectando a ${deviceConfig.ip}...`);
    const zk = new ZKLib(deviceConfig.ip, deviceConfig.port, 5000, 4000);
    try {
        await zk.createSocket();
        const result = await actionCallback(zk);
        return result;
    } catch (e) {
        throw e;
    } finally {
        try { await zk.disconnect(); } catch (e) {}
    }
};

// --- RUTAS DE API ---

// 1. GET DISPOSITIVOS
app.get('/api/devices', async (req, res) => {
    try {
        const devices = await getDevicesFromDB();
        res.json(devices);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 1.1 EDITAR DISPOSITIVO
app.put('/api/devices/:id', (req, res) => {
    const { name, ip, port } = req.body;
    db.run("UPDATE devices SET name = ?, ip = ?, port = ? WHERE id = ?", [name, ip, port, req.params.id], function(err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Dispositivo actualizado correctamente" });
    });
});

// 2. GET USUARIOS (Desde DB Local)
app.get('/api/devices/:id/users', (req, res) => {
    db.all("SELECT * FROM users WHERE device_id = ?", [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        // Mapear al formato esperado por el frontend
        const users = rows.map(r => ({
            userId: r.device_user_id,
            name: r.name,
            role: r.role === 'Admin' ? 14 : 0, // Mapeo inverso simple
            card: r.card,
            uid: r.uid
        }));
        res.json({ success: true, data: users });
    });
});

// 3. EDITAR USUARIO (Local DB)
app.put('/api/users/:uid', (req, res) => {
    const { name, role } = req.body;
    db.run("UPDATE users SET name = ?, role = ? WHERE uid = ?", [name, role, req.params.uid], function(err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Usuario actualizado correctamente" });
    });
});

// 4. GET LOGS (Desde DB Local)
app.get('/api/devices/:id/logs', (req, res) => {
    db.all(`
        SELECT l.*, u.name as user_name 
        FROM logs l 
        LEFT JOIN users u ON l.user_id = u.device_user_id AND l.device_id = u.device_id
        WHERE l.device_id = ? 
        ORDER BY l.timestamp DESC
    `, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        const logs = rows.map(r => ({
            deviceUserId: r.user_id,
            recordTime: r.timestamp,
            ip: 'Local DB', 
            verifyType: r.verify_type
        }));
        res.json({ success: true, data: logs });
    });
});

// 5. SINCRONIZAR (Descargar de ZK -> Guardar en DB)
app.post('/api/devices/:id/sync', async (req, res) => {
    const deviceId = req.params.id;
    
    try {
        const device = await getDeviceById(deviceId);
        if (!device) return res.status(404).json({ success: false, message: "Dispositivo no encontrado" });

        await withZkConnection(device, async (zk) => {
            // 1. Descargar Usuarios
            const users = await zk.getUsers();
            if (users && users.data) {
                const stmt = db.prepare(`
                    INSERT INTO users (device_user_id, name, role, password, card, device_id) 
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(uid) DO UPDATE SET 
                        card = excluded.card,
                        password = excluded.password
                `);
                
                users.data.forEach(u => {
                    db.get("SELECT uid FROM users WHERE device_user_id = ? AND device_id = ?", [u.userId, deviceId], (err, row) => {
                        if (!row) {
                            const roleName = u.role === 14 ? 'Admin' : 'User';
                            db.run("INSERT INTO users (device_user_id, name, role, password, card, device_id) VALUES (?, ?, ?, ?, ?, ?)", 
                                [u.userId, u.name, roleName, u.password, u.cardno, deviceId]);
                        }
                    });
                });
                stmt.finalize();
            }

            // 2. Descargar Logs
            const logs = await zk.getAttendances();
            if (logs && logs.data) {
                const stmt = db.prepare("INSERT OR IGNORE INTO logs (user_id, device_id, timestamp, verify_type, status) VALUES (?, ?, ?, ?, ?)");
                logs.data.forEach(l => {
                    let isoDate = new Date(l.recordTime).toISOString();
                    stmt.run(l.deviceUserId, deviceId, isoDate, l.verifyType, l.status);
                });
                stmt.finalize();
            }
        });

        res.json({ success: true, message: "Sincronización completada exitosamente." });

    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: e.message || "Error de conexión" });
    }
});

// Info Endpoint (Live)
app.post('/api/devices/:id/info', async (req, res) => {
    try {
        const device = await getDeviceById(req.params.id);
        const data = await withZkConnection(device, async (zk) => {
            const info = await zk.getInfo().catch(() => ({}));
            const time = await zk.getTime().catch(() => null);
            const users = await zk.getUsers().catch(() => ({ data: [] }));
            return {
                deviceTime: time || new Date().toISOString(),
                firmwareVersion: info?.firmwareVersion || 'Unknown',
                serialNumber: info?.serialNumber || 'Unknown',
                platform: info?.platform || 'ZLM60',
                capacity: {
                    userCount: users?.data?.length || 0,
                    userCapacity: 1000,
                    logCount: 0, 
                    logCapacity: 100000,
                    fingerprintCount: 0, 
                    fingerprintCapacity: 1000,
                    faceCount: 0,
                    faceCapacity: 500
                }
            };
        });
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 SR-BIO Backend Server (SQLite) running on http://localhost:${PORT}`);
});