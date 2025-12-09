# SR-BIO Security Manager

Panel de control para gestión de dispositivos biométricos ZKTeco.

## Requisitos Previos

- **Node.js** (v18 o superior)
- **Visual Studio Code**
- **Git**

## 🚀 Guía Rápida: De AI Studio a GitHub + VS Code

Para trabajar profesionalmente y mantener este proyecto sincronizado, sigue estos pasos:

### 1. Inicializar el Repositorio Local
Una vez descargados los archivos y abierta la carpeta en Visual Studio Code:

```bash
# Inicializa git en la carpeta
git init

# Añade todos los archivos al control de versiones
git add .

# Guarda la primera versión
git commit -m "Initial commit: SR-BIO App from AI Studio"
```

### 2. Conectar con GitHub
1. Ve a [GitHub.com/new](https://github.com/new).
2. Crea un repositorio vacío (público o privado).
3. Copia la URL del repositorio (ej. `https://github.com/tu-usuario/sr-bio-manager.git`).
4. Ejecuta en tu terminal de VS Code:

```bash
# Vincula tu carpeta local con GitHub
git remote add origin <PEGA_AQUI_LA_URL_DEL_REPO>

# Renombra la rama principal a main (estándar actual)
git branch -M main

# Sube el código
git push -u origin main
```

### 3. Flujo de Trabajo Diario

1. **Backend (Conexión Real):**
   ```bash
   npm install
   npm run server
   ```
   *Esto levanta el puente en el puerto 3000.*

2. **Frontend (Interfaz):**
   En otra terminal:
   ```bash
   npm run dev
   ```
   *Esto levanta la web en el puerto 5173.*

3. **Guardar cambios futuros:**
   Cada vez que modifiques código en VS Code:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push
   ```

## Configuración del Backend (node-zklib)

El archivo `server.js` actúa como puente entre la aplicación web y los dispositivos físicos.

1.  Asegúrate de que tu ordenador tenga acceso de red a las IPs de los terminales ZKTeco.
2.  Edita `server.js` para añadir las IPs reales de tus dispositivos en la constante `DEVICES_DB`.
3.  **Nota para Windows:** `node-zklib` puede requerir herramientas de compilación. Si tienes errores al instalar, ejecuta en PowerShell como Admin: `npm install --global --production windows-build-tools`.

## Uso en la Aplicación

1.  Abre la aplicación en el navegador (`http://localhost:5173`).
2.  Ve a la sección **Configuración** -> **API & Backend (Dev)**.
3.  Desactiva el interruptor **"Usar Mock API"**.
4.  Asegúrate de que la URL del Backend sea `http://localhost:3000/api`.
5.  Ve a **Dispositivos**, selecciona uno y pulsa **"Conectar y Obtener Info"**.
