<div align="center">

# CunConnects

**[English](#english) · [Español](#español)**

![React](https://img.shields.io/badge/React_18-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![PocketBase](https://img.shields.io/badge/PocketBase-B8DBE4?style=flat&logo=pocketbase&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

**Entrepreneurship platform · Plataforma de emprendimiento**

[Live Demo](https://cun-connects-pb.vercel.app)

</div>

---

## English

CunConnects is a comprehensive web platform where entrepreneurial projects and products can be published and discovered. It is developed as a single-page application using React 18 and TypeScript on the frontend and PocketBase (free) on the backend.

### Features

- Publish and browse entrepreneurship projects and products
- User authentication with role-based access control (PocketBase)
- Likes system and shopping cart
- 3D scenes built with Three.js and page transitions with Framer Motion
- Fully responsive UI with Tailwind CSS

### Tech Stack

**Frontend**

| Technology | Role |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool and dev server |
| React Router v6 | Client-side routing |
| Zustand | Global state management |
| React Query | Server state, caching, background sync |
| react-hook-form + Zod | Form handling and validation |
| Three.js | 3D scenes |
| Framer Motion | Animations and page transitions |
| Tailwind CSS | Styling |

**Backend**

| Technology | Role |
|---|---|
| PocketBase | Auth, database, file storage, REST API |
| Docker | Containerized deployment |
| Render | Backend hosting (free tier) |
| UptimeRobot | Keeps Render instance alive (prevents cold starts) |

**Deployment**

| Service | What runs there |
|---|---|
| Vercel | Frontend (React SPA) |
| Render | PocketBase backend (Dockerized) |

### Database Schema

| Collection | Description |
|---|---|
| `users` | Authentication and profile data |
| `projects` | Entrepreneurship projects |
| `products` | Products linked to projects |
| `cart_items` | Per-user cart entries |
| `likes` | User likes on projects and products |

Access rules are defined per collection in PocketBase. Writes require authentication; reads are public.

### Getting Started

**Requirements**
- Node.js 18+
- A running PocketBase instance (local or on Render)

**Install**
```bash
git clone https://github.com/privatednicolas/cun-connects-pb.git
cd cun-connects-pb
npm install
```

**Environment variables**

Copy `.env.example` to `.env` and set your PocketBase URL:
```env
VITE_PB_URL=https://your-pocketbase-instance.onrender.com
```

**Run in development**
```bash
npm run dev
```

**Build for production**
```bash
npm run build
```

### Backend (PocketBase)

The backend is a single PocketBase binary, Dockerized for deployment. The schema migration is written by hand in JS and runs on first boot.

Run locally:
```bash
docker compose up
```

Or download the [PocketBase binary](https://pocketbase.io/docs/) and run:
```bash
./pocketbase serve
```

### Project Structure

```
src/
├── components/     — Reusable UI components
├── pages/          — Route-level page components
├── stores/         — Zustand stores
├── hooks/          — React Query hooks and custom hooks
├── lib/            — PocketBase client config
└── types/          — TypeScript type definitions

pocketbase/
└── migrations/     — Hand-written JS migrations
```

---

## Español

CunConnects es una plataforma web integral donde se pueden publicar, descubrir proyectos y productos de emprendimiento. Está desarrollada como una aplicación de una sola página con React 18 y TypeScript en el frontend y PocketBase (gratis) como backend.

### Funcionalidades

- Publicar y explorar proyectos y productos de emprendimiento
- Autenticación de usuarios con reglas de acceso por rol (PocketBase)
- Sistema de likes y carrito de compras
- Escenas 3D con Three.js y transiciones de página con Framer Motion
- UI totalmente responsiva con Tailwind CSS

### Stack

**Frontend**

| Tecnología | Rol |
|---|---|
| React 18 + TypeScript | Framework de UI |
| Vite | Build tool y servidor de desarrollo |
| React Router v6 | Enrutamiento del lado del cliente |
| Zustand | Estado global |
| React Query | Estado del servidor, caché y sincronización |
| react-hook-form + Zod | Manejo y validación de formularios |
| Three.js | Escenas 3D |
| Framer Motion | Animaciones y transiciones de página |
| Tailwind CSS | Estilos |

**Backend**

| Tecnología | Rol |
|---|---|
| PocketBase | Auth, base de datos, almacenamiento, API REST |
| Docker | Despliegue en contenedor |
| Render | Hosting del backend (free tier) |
| UptimeRobot | Mantiene la instancia activa (evita cold starts) |

**Despliegue**

| Servicio | Qué corre ahí |
|---|---|
| Vercel | Frontend (React SPA) |
| Render | Backend PocketBase (Dockerizado) |

### Esquema de base de datos

| Colección | Descripción |
|---|---|
| `users` | Autenticación y datos de perfil |
| `projects` | Proyectos de emprendimiento |
| `products` | Productos vinculados a proyectos |
| `cart_items` | Entradas del carrito por usuario |
| `likes` | Likes de usuarios en proyectos y productos |

Las reglas de acceso se definen por colección en PocketBase. Las escrituras requieren autenticación; las lecturas son públicas.

### Cómo empezar

**Requisitos**
- Node.js 18+
- Una instancia de PocketBase corriendo (local o en Render)

**Instalación**
```bash
git clone https://github.com/privatednicolas/cun-connects-pb.git
cd cun-connects-pb
npm install
```

**Variables de entorno**

Copia `.env.example` a `.env` y configura la URL de tu PocketBase:
```env
VITE_PB_URL=https://tu-instancia-pocketbase.onrender.com
```

**Ejecutar en desarrollo**
```bash
npm run dev
```

**Compilar para producción**
```bash
npm run build
```

### Backend (PocketBase)

El backend es un binario único de PocketBase, Dockerizado para el despliegue. La migración del esquema está escrita a mano en JS y se aplica en el primer arranque.

Para correrlo localmente:
```bash
docker compose up
```

O descarga el [binario de PocketBase](https://pocketbase.io/docs/) y ejecuta:
```bash
./pocketbase serve
```

### Estructura del proyecto

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

<div align="center">
MIT License · Made by <a href="https://github.com/privatednicolas">privatednicolas</a>
</div>
