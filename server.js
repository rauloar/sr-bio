import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import ZKLib from 'node-zklib';

// NOTA: Asegúrate de tener instalado node-zklib: npm install node-zklib

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// CONFIGURACIÓN DE DISPOSITIVO REAL
const DEVICES_DB = [
    { 
        id: '1', 
        name: 'ZKTeco Real (Local)', 
        ip: '192.168.1.201', 
        port: 4370,
        // Campos adicionales para que el frontend no falle al renderizar la tabla
        model: 'ZK Terminal', 
        firmware: 'Detecting...', 
        status: 'Offline', // Estado inicial
        lastSeen: '-', 
        mac: '00:00:00:00:00:00', 
        gateway: '192.168.1.1', 
        subnet: '255.255.255.0', 
        image: 'https://cdn-icons-png.flaticon.com/512/9638/9638162.png'
    }
];

// --- RUTAS DE API ---

// 1. Obtener lista de dispositivos
app.get('/api/devices', (req, res) => {
    res.json(DEVICES_DB);
});

// 2. Obtener Info Real del Dispositivo
app.post('/api/devices/:id/info', async (req, res) => {
    const deviceId = req.params.id;
    const deviceConfig = DEVICES_DB.find(d => d.id === deviceId);

    if (!deviceConfig) {
        return res.status(404).json({ error: 'Dispositivo no encontrado en la configuración.' });
    }

    console.log(`[SERVER] Intentando conectar a ${deviceConfig.ip}:${deviceConfig.port}...`);

    // Aumentamos timeouts para redes reales
    const zk = new ZKLib(deviceConfig.ip, deviceConfig.port, 10000, 4000);

    try {
        // Crear socket
        await zk.createSocket();
        
        console.log(`[SERVER] Socket creado. Obteniendo información...`);

        const info = await zk.getInfo();
        const time = await zk.getTime();
        
        // Intentar obtener usuarios para el conteo
        let userCount = 0;
        try {
            const users = await zk.getUsers();
            userCount = users ? users.data.length : 0;
        } catch(err) {
            console.warn("[SERVER] No se pudieron leer usuarios:", err.message);
        }

        // Desconectar
        await zk.disconnect();

        console.log(`[SERVER] Éxito conectando a ${deviceConfig.ip}`);

        res.json({
            success: true,
            message: "Conexión exitosa con el dispositivo.",
            data: {
                deviceTime: time, 
                firmwareVersion: info ? info.firmwareVersion : 'Unknown',
                serialNumber: info ? info.serialNumber : 'Unknown',
                platform: info ? info.platform : 'ZLM60',
                capacity: {
                    userCount: userCount,
                    userCapacity: 1000, // Valor por defecto si no se puede leer
                    logCount: 0, 
                    logCapacity: 100000,
                    fingerprintCount: 0, 
                    fingerprintCapacity: 1000,
                    faceCount: 0,
                    faceCapacity: 500
                }
            }
        });

    } catch (e) {
        console.error(`[SERVER] Error fatal conectando con ${deviceConfig.ip}:`, e);
        res.status(500).json({ 
            success: false, 
            message: `Error de conexión ZK: ${e.message || "Timeout o destino inalcanzable"}` 
        });
    }
});

// 3. Sincronizar (Placeholder)
app.post('/api/devices/:id/sync', async (req, res) => {
    console.log(`[SERVER] Sincronizando dispositivo ${req.params.id}...`);
    setTimeout(() => {
        res.json({ success: true, message: "Sincronización completada" });
    }, 2000);
});

// 4. Descargar Logs (Placeholder)
app.post('/api/logs/download', async (req, res) => {
    console.log("[SERVER] Iniciando descarga masiva de logs...");
    res.json({ success: true, count: 0, message: "Descarga iniciada" });
});

app.listen(PORT, () => {
    console.log(`
    🚀 SR-BIO Backend Server running on http://localhost:${PORT}
    
    Target Device: ${DEVICES_DB[0].ip}:${DEVICES_DB[0].port}
    `);
});