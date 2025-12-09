import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import ZKLib from 'node-zklib';
import net from 'net';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

// NOTA: Recuerda ejecutar 'npm install' para las dependencias

const app = express();
const PORT = 3000;
const DB_PATH = './sr-bio.db';

app.use(cors());
app.use(bodyParser.json());

// --- DATABASE SETUP (SQLite) ---
const connectDB = () => {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) console.error('Error opening database:', err.message);
    });
};

const db = connectDB();

// --- DB INITIALIZATION LOGIC ---
const initializeTables = (callback) => {
    db.serialize(() => {
        
        // 1. Tabla Auth Users (Sistema Web)
        db.run(`CREATE TABLE IF NOT EXISTS auth_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            created_at TEXT
        )`);

        // 2. Tabla Dispositivos
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

        // 3. Tabla Usuarios (Datos Hardware/ZK)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            uid INTEGER PRIMARY KEY AUTOINCREMENT,
            device_user_id TEXT, 
            name TEXT,
            role TEXT,
            password TEXT,
            card TEXT,
            device_id TEXT,
            FOREIGN KEY(device_id) REFERENCES devices(id),
            UNIQUE(device_user_id, device_id)
        )`);

        // 4. Tabla Detalles de Usuario (Datos de Negocio/Extendidos)
        db.run(`CREATE TABLE IF NOT EXISTS user_details (
            user_uid INTEGER PRIMARY KEY,
            lastname TEXT,
            address TEXT,
            city TEXT,
            province TEXT,
            cuit TEXT,
            phone TEXT,
            email TEXT,
            FOREIGN KEY(user_uid) REFERENCES users(uid) ON DELETE CASCADE
        )`);

        // 5. Tabla Logs
        db.run(`CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            device_id TEXT,
            timestamp TEXT,
            verify_type INTEGER,
            status INTEGER,
            UNIQUE(user_id, timestamp, device_id)
        )`);

        // Seed Dispositivo Default
        db.get("SELECT count(*) as count FROM devices", [], (err, row) => {
            if (!err && row && row.count === 0) {
                console.log("[DB] Seeding default device...");
                db.run(`INSERT INTO devices (id, name, ip, port, model, status, last_seen, mac, image) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                        ['1', 'ZKTeco Entrada', '192.168.1.201', 4370, 'ZK Terminal', 'Offline', '-', '00:00:00:00:00:00', 'https://cdn-icons-png.flaticon.com/512/9638/9638162.png']);
            }
            if(callback) callback({ success: true, message: "Tablas inicializadas correctamente." });
        });
    });
};

initializeTables(() => console.log('[DB] Database checks complete.'));

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

// --- AUTH ROUTE ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Usuario y contraseña requeridos" });
    }

    db.get("SELECT count(*) as count FROM auth_users", [], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        // ESCENARIO 1: Primera vez (Base vacía) -> Crear Root
        if (row.count === 0) {
            if (username.toLowerCase() !== 'root' && username.toLowerCase() !== 'admin') {
                // Opcional: Forzar que el primer usuario sea admin/root, o permitir cualquiera
            }
            const createdAt = new Date().toISOString();
            db.run("INSERT INTO auth_users (username, password, role, created_at) VALUES (?, ?, 'root', ?)", 
                [username, password, createdAt], 
                function(err) {
                    if (err) return res.status(500).json({ success: false, message: "Error al crear usuario root" });
                    
                    return res.json({ 
                        success: true, 
                        message: "Usuario ROOT creado exitosamente. Bienvenido.",
                        user: { username, role: 'root' },
                        token: 'session-token-root-created' // En prod usar JWT real
                    });
                }
            );
        } else {
            // ESCENARIO 2: Login Normal
            db.get("SELECT * FROM auth_users WHERE username = ? AND password = ?", [username, password], (err, user) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                
                if (!user) {
                    return res.json({ success: false, message: "Credenciales inválidas." });
                }

                return res.json({ 
                    success: true, 
                    user: { username: user.username, role: user.role },
                    token: `session-token-${user.id}`
                });
            });
        }
    });
});


// --- RUTAS DE API NEGOCIO ---

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

// 2. GET USUARIOS (JOIN users + user_details)
app.get('/api/devices/:id/users', (req, res) => {
    const sql = `
        SELECT u.*, ud.lastname, ud.address, ud.city, ud.province, ud.cuit, ud.phone, ud.email
        FROM users u
        LEFT JOIN user_details ud ON u.uid = ud.user_uid
        WHERE u.device_id = ?
    `;
    
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        
        const users = rows.map(r => ({
            userId: r.device_user_id,
            name: r.name,
            role: r.role === 'Admin' ? 14 : 0, 
            card: r.card,
            uid: r.uid,
            // Datos Extendidos
            lastname: r.lastname || '',
            address: r.address || '',
            city: r.city || '',
            province: r.province || '',
            cuit: r.cuit || '',
            phone: r.phone || '',
            email: r.email || ''
        }));
        res.json({ success: true, data: users });
    });
});

// 3. EDITAR USUARIO (Actualiza ambas tablas)
app.put('/api/users/:uid', (req, res) => {
    const uid = req.params.uid;
    const { 
        name, role, // Tabla users
        lastname, address, city, province, cuit, phone, email // Tabla user_details
    } = req.body;

    db.serialize(() => {
        // 1. Actualizar tabla principal
        db.run("UPDATE users SET name = ?, role = ? WHERE uid = ?", [name, role, uid], (err) => {
            if (err) console.error("Error updating users table", err);
        });

        // 2. Upsert tabla detalles (Insert or Replace)
        const sqlDetails = `
            INSERT INTO user_details (user_uid, lastname, address, city, province, cuit, phone, email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_uid) DO UPDATE SET
                lastname=excluded.lastname,
                address=excluded.address,
                city=excluded.city,
                province=excluded.province,
                cuit=excluded.cuit,
                phone=excluded.phone,
                email=excluded.email
        `;
        
        db.run(sqlDetails, [uid, lastname, address, city, province, cuit, phone, email], function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: "Usuario actualizado correctamente" });
        });
    });
});

// 4. GET LOGS (JOIN user_details)
app.get('/api/devices/:id/logs', (req, res) => {
    db.all(`
        SELECT l.*, u.name as user_name, ud.lastname as user_lastname
        FROM logs l 
        LEFT JOIN users u ON l.user_id = u.device_user_id AND l.device_id = u.device_id
        LEFT JOIN user_details ud ON u.uid = ud.user_uid
        WHERE l.device_id = ? 
        ORDER BY l.timestamp DESC
    `, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        const logs = rows.map(r => ({
            deviceUserId: r.user_id,
            userName: r.user_name,
            userLastname: r.user_lastname,
            recordTime: r.timestamp,
            ip: 'Local DB', 
            verifyType: r.verify_type
        }));
        res.json({ success: true, data: logs });
    });
});

// 5. SINCRONIZAR
app.post('/api/devices/:id/sync', async (req, res) => {
    const deviceId = req.params.id;
    try {
        const device = await getDeviceById(deviceId);
        if (!device) return res.status(404).json({ success: false, message: "Dispositivo no encontrado" });

        await withZkConnection(device, async (zk) => {
            const users = await zk.getUsers();
            if (users && users.data) {
                const stmt = db.prepare(`
                    INSERT INTO users (device_user_id, name, role, password, card, device_id) 
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(device_user_id, device_id) DO UPDATE SET 
                        card = excluded.card,
                        password = excluded.password
                `);
                
                users.data.forEach(u => {
                    const roleName = u.role === 14 ? 'Admin' : 'User';
                    stmt.run(u.userId, u.name, roleName, u.password, u.cardno, deviceId);
                });
                stmt.finalize();
            }

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
        res.json({ success: true, message: "Sincronización completada. Datos locales preservados." });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: e.message || "Error de conexión" });
    }
});

// Info Endpoint
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

// DB Management Endpoints
app.get('/api/db/status', (req, res) => {
    const exists = fs.existsSync(DB_PATH);
    let size = 0;
    if (exists) {
        const stats = fs.statSync(DB_PATH);
        size = stats.size;
    }
    if (!exists) return res.json({ exists: false, size: 0, tables: 0, message: "Archivo de base de datos no encontrado." });

    db.get("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", [], (err, row) => {
        if (err) return res.json({ exists: true, size, tables: 0, error: err.message });
        res.json({ exists: true, size, tables: row.count, path: path.resolve(DB_PATH) });
    });
});

app.post('/api/db/init', (req, res) => {
    initializeTables((result) => { res.json(result); });
});

app.post('/api/db/backup', (req, res) => {
    if (!fs.existsSync(DB_PATH)) return res.status(404).json({ success: false, message: "No hay base de datos para respaldar." });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `./sr-bio-backup-${timestamp}.db`;
    fs.copyFile(DB_PATH, backupPath, (err) => {
        if (err) return res.status(500).json({ success: false, message: "Error al crear respaldo: " + err.message });
        res.json({ success: true, message: `Respaldo creado: ${backupPath}` });
    });
});

app.post('/api/db/optimize', (req, res) => {
    db.run("VACUUM;", (err) => {
        if (err) return res.status(500).json({ success: false, message: "Error al optimizar: " + err.message });
        res.json({ success: true, message: "Base de datos optimizada (VACUUM ejecutado)." });
    });
});

// Background Monitor
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
            db.run("UPDATE devices SET status = ?, last_seen = ? WHERE id = ?", [status, lastSeen, device.id]);
        }
    } catch (e) {}
};

setInterval(monitorDevices, 30000);
monitorDevices();

app.listen(PORT, () => {
    console.log(`🚀 SR-BIO Backend Server (SQLite) running on http://localhost:${PORT}`);
});