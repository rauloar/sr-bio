# SR-BIO Security Manager

System for managing ZKTeco biometric devices, users, and attendance logs. Built with **React** (Frontend) and **Python/FastAPI** (Backend).

## 🏗 Project Structure

- **`src/`**: Frontend source code (React, TypeScript, TailwindCSS).
- **`backend/`**: Backend source code (Python, FastAPI, pyzk).
- **`db/`**: Stores the SQLite database (`sr-bio.db`).
- **`root`**: Configuration files (`vite.config.ts`, `package.json`, etc.).

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
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

### 2. Install Frontend Dependencies
Installs React, Vite, and UI libraries.

```bash
npm install
```

### 3. Install Backend Dependencies
Installs FastAPI, Uvicorn, and pyzk.

```bash
pip install -r requirements.txt
```

---

## 🏃‍♂️ Running the Application

You need to run **two** terminals simultaneously (one for the Backend and one for the Frontend).

### Terminal 1: Backend (API & Device Connection)
This starts the Python server on port **8000**.

```bash
npm run backend
```
*Alternative (Manual Python command):*
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Terminal 2: Frontend (User Interface)
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
   - Ensure API URL is `http://localhost:8000/api`.
3. **Add Devices**:
   - Go to **Devices**.
   - Add your ZKTeco device IP and Port (Default 4370).
   - Click **"Conectar y Obtener Info"** to verify connection.

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite.
- **Backend**: Python 3.x, FastAPI.
- **Driver**: `pyzk` (Native ZKTeco Protocol).
- **Database**: SQLite.

## ⚠️ Troubleshooting

- **Connection Refused**: Ensure the backend is running on port 8000.
- **Device Timeout**: Check if the device IP is reachable (`ping <device-ip>`) and that no other software (like ZKAccess) is holding the connection.
- **Database Errors**: Ensure the `db/` folder has write permissions. You can re-initialize the DB in **Settings > Base de Datos**.
