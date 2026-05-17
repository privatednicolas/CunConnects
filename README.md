# CunConnects

Plataforma web de emprendimiento para estudiantes de la CUN (Corporación Unificada Nacional). Permite publicar y descubrir proyectos y productos de emprendedores. Construida como SPA full-stack con React 18 + TypeScript en el frontend y PocketBase como backend, desplegada en Vercel y Render.

**Demo en vivo:** [cun-connects-pb.vercel.app](https://cun-connects-pb.vercel.app)

---

## Funcionalidades

- Publicar y explorar proyectos y productos de emprendimiento
- Autenticación de usuarios con reglas de acceso por rol (PocketBase)
- Sistema de likes y carrito de compras
- Escenas 3D con Three.js y transiciones de página con Framer Motion
- UI totalmente responsiva con Tailwind CSS

---

## Stack

### Frontend

| Tecnología | Rol |
|---|---|
| React 18 + TypeScript | Framework de UI |
| Vite | Build tool y servidor de desarrollo |
| React Router v6 | Enrutamiento del lado del cliente |
| Zustand | Estado global |
| React Query | Estado del servidor, caché y sincronización en segundo plano |
| react-hook-form + Zod | Manejo y validación de formularios |
| Three.js | Escenas 3D |
| Framer Motion | Animaciones y transiciones de página |
| Tailwind CSS | Estilos |

### Backend

| Tecnología | Rol |
|---|---|
| PocketBase | Backend as a service (auth, base de datos, almacenamiento de archivos, API REST) |
| Docker | Despliegue en contenedor |
| Render | Hosting del backend (free tier) |
| UptimeRobot | Mantiene la instancia de Render activa (evita cold starts) |

### Despliegue

| Servicio | Qué corre ahí |
|---|---|
| Vercel | Frontend (React SPA) |
| Render | Backend PocketBase (Dockerizado) |

---

## Esquema de base de datos

| Colección | Descripción |
|---|---|
| `users` | Autenticación y datos de perfil |
| `projects` | Proyectos de emprendimiento |
| `products` | Productos vinculados a proyectos |
| `cart_items` | Entradas del carrito por usuario |
| `likes` | Likes de usuarios en proyectos y productos |

Las reglas de acceso se definen por colección en PocketBase. Las escrituras requieren autenticación; las lecturas son públicas.

---

## Cómo empezar

### Requisitos
- Node.js 18+
- Una instancia de PocketBase corriendo (local o en Render)

### Instalación

```bash
git clone https://github.com/privatednicolas/cun-connects-pb.git
cd cun-connects-pb
npm install
```

### Configurar variables de entorno

Copia `.env.example` a `.env` y configura la URL de tu PocketBase:

```env
VITE_PB_URL=https://tu-instancia-pocketbase.onrender.com
```

### Ejecutar en desarrollo

```bash
npm run dev
```

### Compilar para producción

```bash
npm run build
```

---

## Backend (PocketBase)

El backend es un binario único de PocketBase, Dockerizado para el despliegue. La migración del esquema está escrita a mano en JS y se aplica en el primer arranque.

Para correrlo localmente:

```bash
docker compose up
```

O descarga el [binario de PocketBase](https://pocketbase.io/docs/) y ejecuta:

```bash
./pocketbase serve
```

---

## Estructura del proyecto

```
src/
├── components/     — Componentes de UI reutilizables
├── pages/          — Componentes de página a nivel de ruta
├── stores/         — Stores de Zustand
├── hooks/          — Hooks de React Query y hooks personalizados
├── lib/            — Configuración del cliente PocketBase
└── types/          — Definiciones de tipos TypeScript
pocketbase/
└── migrations/     — Migraciones JS escritas a mano
```

---

## Licencia

MIT
