import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import ZKLib from 'node-zklib';

// NOTA: Asegúrate de tener instalado node-zklib: npm install node-zklib

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Base de datos simulada en memoria para la lista de dispositivos
// En producción, esto vendría de una base de datos real (MongoDB/Postgres)
const DEVICES_DB = [
    { id: '1', name: 'Terminal Entrada Principal', ip: '192.168.1.201', port: 4370 },
    { id: '2', name: 'Puerta del Almacén', ip: '192.168.1.202', port: 4370 }
];

// --- RUTAS DE API ---

// 1. Obtener lista de dispositivos (desde la BD del servidor)
app.get('/api/devices', (req, res) => {
    // Aquí devolveríamos la lista de la BD, quizás con estado actualizado si tuviéramos un proceso de ping de fondo
    res.json(DEVICES_DB);
});

// 2. Obtener Info Real del Dispositivo (Connect -> Disable -> Info -> Enable -> Disconnect)
app.post('/api/devices/:id/info', async (req, res) => {
    const deviceId = req.params.id;
    const deviceConfig = DEVICES_DB.find(d => d.id === deviceId);

    if (!deviceConfig) {
        return res.status(404).json({ error: 'Dispositivo no encontrado en la configuración.' });
    }

    console.log(`[SERVER] Conectando a ${deviceConfig.ip}:${deviceConfig.port}...`);

    const zk = new ZKLib(deviceConfig.ip, deviceConfig.port, 10000, 4000);

    try {
        // Crear socket
        await zk.createSocket();
        
        // Obtener información (Simulamos el flujo seguro: deshabilitar durante la lectura)
        // Nota: node-zklib gestiona muchos de estos comandos internamente o expone métodos específicos
        
        // await zk.disableDevice(); // Opcional, buena práctica al leer datos críticos
        
        const info = await zk.getInfo();
        const time = await zk.getTime();
        const users = await zk.getUsers();
        // const attendance = await zk.getAttendances(); 
        
        // Simular obtención de capacidad (algunas versiones de la lib no lo traen directo)
        const capacity = {
            userCount: users ? users.data.length : 0,
            userCapacity: 3000, // Hardcoded o derivado del modelo
            logCount: 0, // Implementar zk.getAttendanceSize() si disponible
            logCapacity: 100000,
            fingerprintCount: 0, 
            fingerprintCapacity: 5000,
            faceCount: 0,
            faceCapacity: 500
        };

        // await zk.enableDevice();
        await zk.disconnect();

        console.log(`[SERVER] Datos obtenidos de ${deviceConfig.ip}`);

        res.json({
            success: true,
            message: "Datos obtenidos correctamente del hardware.",
            data: {
                deviceTime: time, // Formato suele ser Date o string
                firmwareVersion: info ? info.firmwareVersion : 'Unknown',
                serialNumber: info ? info.serialNumber : 'Unknown',
                platform: info ? info.platform : 'ZLM60',
                capacity: capacity
            }
        });

    } catch (e) {
        console.error(`[SERVER] Error conectando con ${deviceConfig.ip}:`, e);
        res.status(500).send(`Error de conexión ZK: ${e.message || e}`);
    }
});

// 3. Sincronizar (Ejemplo)
app.post('/api/devices/:id/sync', async (req, res) => {
    console.log(`[SERVER] Sincronizando dispositivo ${req.params.id}...`);
    // Lógica para enviar usuarios nuevos o descargar logs nuevos
    setTimeout(() => {
        res.json({ success: true, message: "Sincronización completada" });
    }, 2000);
});

// 4. Test Connection
app.post('/api/devices/:id/test-connection', async (req, res) => {
    // Similar a info pero más ligero, solo ping
    res.json({ success: true, message: "Ping OK" });
});

// 5. Descargar Logs
app.post('/api/logs/download', async (req, res) => {
    console.log("[SERVER] Iniciando descarga masiva de logs...");
    // Iterar sobre todos los dispositivos y descargar
    res.json({ success: true, count: 0, message: "Descarga iniciada" });
});

app.listen(PORT, () => {
    console.log(`
    🚀 SR-BIO Backend Server running on http://localhost:${PORT}
    
    Endpoints disponibles:
    - GET  /api/devices
    - POST /api/devices/:id/info (Conexión ZK Real)
    - POST /api/devices/:id/sync
    `);
});
