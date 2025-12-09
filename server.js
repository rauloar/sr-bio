import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import ZKLib from 'node-zklib';
import net from 'net';

// NOTA: Recuerda ejecutar 'npm install' para obtener la versión github:caobo171/node-zklib

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// CONFIGURACIÓN DE DISPOSITIVOS (BASE DE DATOS EN MEMORIA)
// En producción, esto vendría de una base de datos real (SQLite/MongoDB)
const DEVICES_DB = [
    { 
        id: '1', 
        name: 'ZKTeco Entrada', 
        ip: '192.168.1.201', 
        port: 4370,
        model: 'ZK Terminal', 
        firmware: 'Detecting...', 
        status: 'Offline', 
        lastSeen: '-', 
        mac: '00:00:00:00:00:00', 
        gateway: '192.168.1.1', 
        subnet: '255.255.255.0', 
        image: 'https://cdn-icons-png.flaticon.com/512/9638/9638162.png'
    }
];

// --- BACKGROUND MONITOR SERVICE ---
const pingDevice = (host, port, timeout = 3000) => {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        
        socket.setTimeout(timeout);
        
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        
        socket.on('error', (err) => {
            socket.destroy();
            resolve(false);
        });
        
        socket.connect(port, host);
    });
};

const monitorDevices = async () => {
    console.log('[MONITOR] Iniciando chequeo de estado de dispositivos...');
    
    for (const device of DEVICES_DB) {
        const isOnline = await pingDevice(device.ip, device.port);
        const prevStatus = device.status;
        
        device.status = isOnline ? 'Online' : 'Offline';
        
        if (isOnline) {
            device.lastSeen = new Date().toLocaleString();
            // Si estaba offline y ahora online, podríamos intentar leer info básica aquí
        }
        
        if (prevStatus !== device.status) {
            console.log(`[MONITOR] ${device.name} (${device.ip}) cambió a ${device.status}`);
        }
    }
};

// Ejecutar monitor cada 30 segundos
setInterval(monitorDevices, 30000);
// Ejecutar al inicio inmediatamente
monitorDevices();


// --- HELPER PARA CONEXIÓN SEGURA ---
const withZkConnection = async (deviceId, actionCallback) => {
    const deviceConfig = DEVICES_DB.find(d => d.id === deviceId);
    if (!deviceConfig) throw new Error('Dispositivo no encontrado');

    console.log(`[SERVER] Conectando a ${deviceConfig.ip}...`);
    const zk = new ZKLib(deviceConfig.ip, deviceConfig.port, 5000, 4000); // 5s timeout

    try {
        await zk.createSocket();
        console.log(`[SERVER] Conectado a ${deviceConfig.ip}`);
        const result = await actionCallback(zk);
        return result;
    } catch (e) {
        console.error(`[SERVER] Error con ${deviceConfig.ip}:`, e.message);
        throw e;
    } finally {
        try { await zk.disconnect(); } catch (e) {}
    }
};

// --- RUTAS DE API ---

// 1. Obtener lista de dispositivos configurados
app.get('/api/devices', (req, res) => {
    res.json(DEVICES_DB);
});

// 2. Info General (Diagnóstico)
app.post('/api/devices/:id/info', async (req, res) => {
    try {
        const data = await withZkConnection(req.params.id, async (zk) => {
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

        // Actualizar estado si fue exitoso
        const dev = DEVICES_DB.find(d => d.id === req.params.id);
        if (dev) {
            dev.status = 'Online';
            dev.lastSeen = new Date().toLocaleString();
            if (data.firmwareVersion !== 'Unknown') dev.firmware = data.firmwareVersion;
        }

        res.json({ success: true, data });
    } catch (e) {
        // Actualizar estado si falló conexión
        const dev = DEVICES_DB.find(d => d.id === req.params.id);
        if (dev) dev.status = 'Offline';
        
        res.status(500).json({ success: false, message: e.message || "Error de conexión" });
    }
});

// 3. OBTENER USUARIOS REALES DEL TERMINAL
app.get('/api/devices/:id/users', async (req, res) => {
    try {
        const users = await withZkConnection(req.params.id, async (zk) => {
             // zk.getUsers() devuelve { data: [ { uid, userId, name, ... } ] }
             const result = await zk.getUsers();
             return result.data || [];
        });
        res.json({ success: true, data: users });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// 4. OBTENER LOGS DE ASISTENCIA REALES
app.get('/api/devices/:id/logs', async (req, res) => {
    try {
        const logs = await withZkConnection(req.params.id, async (zk) => {
            // zk.getAttendances() devuelve { data: [ { deviceUserId, recordTime, ... } ] }
            const result = await zk.getAttendances();
            return result.data || [];
        });
        res.json({ success: true, data: logs });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// 5. Borrar Logs (Cuidado!)
app.delete('/api/devices/:id/logs', async (req, res) => {
    try {
        await withZkConnection(req.params.id, async (zk) => {
            await zk.clearAttendanceLog();
        });
        res.json({ success: true, message: "Logs borrados del terminal." });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// 6. Sincronizar (Placeholder)
app.post('/api/devices/:id/sync', async (req, res) => {
    res.json({ success: true, message: "Comando de sincronización enviado." });
});

app.listen(PORT, () => {
    console.log(`
    🚀 SR-BIO Backend Server running on http://localhost:${PORT}
    
    Target Device: ${DEVICES_DB[0].ip}:${DEVICES_DB[0].port}
    `);
});