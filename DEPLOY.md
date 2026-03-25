# 🚀 Guía de Despliegue - MotoTaxi App + Cloudflare D1

## ✅ Requisitos

- Cuenta de [Cloudflare](https://cloudflare.com) (gratis)
- Cuenta de [GitHub](https://github.com)
- Base de datos D1 creada en Cloudflare

---

## 📦 Paso 1: Subir a GitHub

```bash
cd /mnt/okcomputer/output/app

# Inicializar git
git init
git add .
git commit -m "MotoTaxi App con Cloudflare D1"

# Crear repo en GitHub primero (github.com/new)
# Luego conectar:
git branch -M main
git remote add origin https://github.com/TU_USUARIO/moto-taxi-app.git
git push -u origin main
```

---

## ⚡ Paso 2: Configurar Cloudflare Pages

### 2.1 Crear Proyecto en Pages

1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com)
2. Menú lateral → **Pages** → **Create a project**
3. Selecciona **"Connect to Git"**
4. Autoriza Cloudflare a acceder a tu GitHub
5. Selecciona el repositorio `moto-taxi-app`

### 2.2 Configuración de Build

| Configuración | Valor |
|--------------|-------|
| **Framework preset** | `Vite` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

### 2.3 Conectar D1 Database (IMPORTANTE)

Después de crear el proyecto:

1. Ve a tu proyecto en Cloudflare Pages
2. Click en **"Settings"** → **"Functions"**
3. Sección **"D1 database bindings"**
4. Click **"Add binding"**
5. Completa:
   - **Variable name**: `DB`
   - **D1 database**: Selecciona `dorys_db`
6. Click **"Save"**

### 2.4 Redeploy

1. Ve a la pestaña **"Deployments"**
2. Click en **"Retry deployment"** o haz un nuevo push a GitHub

---

## 🔧 Configuración del wrangler.toml (Ya incluido)

El archivo `wrangler.toml` ya tiene tu database ID configurada:

```toml
[[d1_databases]]
binding = "DB"
database_name = "dorys_db"
database_id = "b8755e8b-7a99-46ce-b82e-71664c1871ce"
```

---

## 🗄️ Estructura de Tablas (D1)

Tu base de datos `dorys_db` debe tener estas tablas:

```sql
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  lat REAL DEFAULT 0,
  lng REAL DEFAULT 0,
  details TEXT,
  bio TEXT DEFAULT 'Sin biografía',
  avatar_url TEXT,
  status TEXT DEFAULT 'offline',
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  stars INTEGER DEFAULT 5,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Probar Localmente (Opcional)

```bash
# Instalar dependencias
npm install

# Instalar Wrangler CLI
npm install -g wrangler

# Login en Cloudflare
wrangler login

# Desarrollo local con D1
wrangler pages dev --d1 DB=b8755e8b-7a99-46ce-b82e-71664c1871ce
```

---

## 🔄 Actualizar la App

```bash
# Hacer cambios
git add .
git commit -m "Nuevos cambios"
git push origin main

# Cloudflare Pages se actualiza automáticamente!
```

---

## 🐛 Solución de Problemas

### Error "DB binding not found"
- Verifica que el binding en Cloudflare Pages Settings → Functions esté configurado
- El nombre debe ser exactamente `DB`

### Error "database not found"
- Verifica que el `database_id` en `wrangler.toml` sea correcto
- Ejecuta `wrangler d1 list` para ver tus bases de datos

### Error 404 en /api/*
- Las funciones deben estar en la carpeta `functions/`
- Verifica que el archivo `functions/api/[[path]].ts` exista

---

## 📱 Tu App en Producción

Una vez desplegada, tu app estará en:
`https://moto-taxi-app.pages.dev` (o el nombre que elijas)

**¡Lista para usar con datos reales!** 🎉
