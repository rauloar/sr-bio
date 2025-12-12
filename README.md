# SR-BIO Security Manager

System for managing ZKTeco biometric devices, users, and attendance logs. Built with **React** (Frontend) and **Node.js/Express** (Backend). Uses the [jmrashed/zkteco](https://github.com/jmrashed/zkteco) library for native ZKTeco protocol.

## 🏗 Project Structure

- **`src/`**: Frontend source code (React, TypeScript, TailwindCSS).
- **`backend-node/`**: Node.js backend (Express + zkteco)
- **`db/`**: Stores the SQLite database (`sr-bio.db`).
- **`root`**: Configuration files (`vite.config.ts`, `package.json`, etc.).

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Git**
- **Visual Studio Code** (Recommended)

## 🚀 Installation & Setup

### 1. Initialize Repository
If you have just downloaded the code:

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Clean & Install Dependencies
If you are migrating from the old version or having issues, run these commands to start fresh.

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
cd backend-node
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
cd ..
npm install
cd backend-node
npm install
```

**Mac/Linux/Git Bash:**
```bash
rm -rf node_modules package-lock.json
cd backend-node
rm -rf node_modules package-lock.json
cd ..
npm install
cd backend-node
npm install
```

### 3. Running the Application

You need to run **two** terminals simultaneously (one for the Backend and one for the Frontend).

#### Terminal 1: Backend (API & Device Connection)
This starts the Node.js backend on port **4000** (default).

```bash
cd backend-node
npm run dev
```


#### Terminal 2: Frontend (User Interface)
This starts the React application on port **5173**.

```bash
npm run dev
```

OPEN: [http://localhost:5173](http://localhost:5173)

---

## ⚙️ Configuration

1. **Login**: Default root user will be created upon first login (username/password provided in prompt or auto-generated in `auth_users` table if empty).
2. **Connect Backend**:
   - Go to **Settings (Configuración)** > **Dev API**.
   - Ensure **"Usar Mock API"** is **OFF**.
   - Ensure API URL is `http://localhost:4000/api`.
3. **Add Devices**:
   - Go to **Devices**.
   - Add your ZKTeco device IP and Port (Default 4370).
   - Click **"Conectar y Obtener Info"** to verify connection.

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite.
- **Backend**: Node.js, Express, [jmrashed/zkteco](https://github.com/jmrashed/zkteco)
- **Database**: SQLite.

## ⚠️ Troubleshooting

- **Connection Refused**: Ensure the backend is running on port 4000.
- **Device Timeout**: Check if the device IP is reachable (`ping <device-ip>`) and that no other software (like ZKAccess) is holding the connection.
- **Database Errors**: Ensure the `db/` folder has write permissions. You can re-initialize the DB in **Settings > Base de Datos**.
