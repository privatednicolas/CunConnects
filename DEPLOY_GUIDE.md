# 🚀 Guía Completa — CunConnects
## PocketBase en Render + UptimeRobot + Vercel (todo gratis, sin tarjeta)

---

## Estructura del proyecto

```
CunConnects/
├── src/                   ← tu app React (frontend)
├── pocketbase/
│   ├── Dockerfile         ← imagen del backend (lista para Render)
│   └── pb_migrations/     ← crea las colecciones AUTOMÁTICAMENTE al iniciar
├── vercel.json            ← config de Vercel
└── .env.example           ← copia a .env con tu URL real de Render
```

---

# PARTE 1 — Backend: PocketBase en Render

> Render ofrece un Web Service gratuito que corre Docker.
> No pide tarjeta. El único detalle: se duerme a los 15 min
> sin tráfico — por eso usamos UptimeRobot en la Parte 3.

## Paso 1.1 — Sube el proyecto a GitHub

Desde la carpeta raíz CunConnects/:

```bash
git init
git add .
git commit -m "CunConnects inicial"
```

Crea un repo en https://github.com/new, luego:

```bash
git remote add origin https://github.com/TU_USUARIO/cunconnects.git
git branch -M main
git push -u origin main
```

---

## Paso 1.2 — Crea el Web Service en Render

1. Ve a https://render.com → regístrate gratis con GitHub (sin tarjeta).
2. Clic en New + → Web Service.
3. Conecta tu cuenta de GitHub → selecciona el repo cunconnects.
4. Configura así:

| Campo             | Valor                  |
|-------------------|------------------------|
| Name              | cunconnects-pb         |
| Region            | Oregon (US West)       |
| Branch            | main                   |
| Root Directory    | pocketbase             |
| Environment       | Docker                 |
| Instance Type     | Free                   |

5. Deja todo lo demás por defecto → clic en Create Web Service.

Render detecta el Dockerfile dentro de pocketbase/ y construye la imagen. La primera vez tarda ~3 minutos.

---

## Paso 1.3 — Anota tu URL de Render

Cuando el deploy diga Live, verás arriba una URL como:

```
https://cunconnects-pb.onrender.com
```

Guárdala. La usarás en los pasos siguientes.

---

## Paso 1.4 — Crea tu cuenta admin (tienes 5 minutos)

Abre en el navegador:

```
https://cunconnects-pb.onrender.com/_/
```

Verás "Setup your Admin account". Ingresa email y contraseña → Create.

Las colecciones se crean solas gracias a pb_migrations/.
Ve a Collections y confirma: projects, products, comments, reviews,
follows, project_tags, project_likes, notifications.

---

## Paso 1.5 — Configura CORS

En el admin de PocketBase:
1. Settings (engranaje abajo izquierda) → Application
2. Allowed Origins — agrega:
   http://localhost:5173
   https://TU-APP.vercel.app
3. Save changes

---

# PARTE 2 — Frontend: Vercel

## Paso 2.1 — Deploy en Vercel

1. Ve a https://vercel.com → crea cuenta con GitHub.
2. New Project → importa tu repo cunconnects.
3. Antes de Deploy, en Environment Variables agrega:
   - Name:  VITE_PB_URL
   - Value: https://cunconnects-pb.onrender.com
4. Clic en Deploy.

---

## Paso 2.2 — Actualiza CORS

Vuelve al admin PocketBase y pon tu URL real de Vercel en Allowed Origins.

---

## Paso 2.3 — .env local

Copia .env.example como .env y pon:

```
VITE_PB_URL=https://cunconnects-pb.onrender.com
```

---

# PARTE 3 — UptimeRobot (ping cada 5 min)

El free tier de Render duerme el servicio tras 15 min sin tráfico.
UptimeRobot lo mantiene despierto.

## Paso 3.1 — Crear cuenta

Ve a https://uptimerobot.com → regístrate gratis.

## Paso 3.2 — Crear el monitor

1. Add New Monitor
2. Configura:

| Campo               | Valor                                              |
|---------------------|----------------------------------------------------|
| Monitor Type        | HTTP(s)                                            |
| Friendly Name       | CunConnects PocketBase                             |
| URL                 | https://cunconnects-pb.onrender.com/api/health     |
| Monitoring Interval | 5 minutes                                          |

3. Alert Contacts → agrega tu email.
4. Create Monitor.

El endpoint /api/health es nativo de PocketBase y siempre responde
{"code":200,"message":"API is healthy."}

---

# Resumen

```
Usuario → Vercel (React) → PocketBase en Render (Docker)
                                    ↑
                         UptimeRobot ping c/5min
```

| Servicio      | Precio  |
|---------------|---------|
| Vercel        | $0      |
| Render        | $0      |
| UptimeRobot   | $0      |
| TOTAL         | $0/mes  |

---

# Flujo de actualizaciones

Cada git push a main redeploya automáticamente:
- Vercel redeploya el frontend.
- Render redeploya el backend.

---

# Errores comunes

| Error                          | Solución                                          |
|--------------------------------|---------------------------------------------------|
| /_/ no carga                   | Espera 1-2 min, Render está calentando            |
| CORS error en el navegador     | Agrega tu URL Vercel en Allowed Origins del admin |
| Colecciones no aparecen        | Admin → Settings → Logs para ver el error         |
| VITE_PB_URL is not defined     | Asegúrate de crear .env copiando .env.example     |
| Render muestra "Build failed"  | Verifica Root Directory = pocketbase (exacto)     |
