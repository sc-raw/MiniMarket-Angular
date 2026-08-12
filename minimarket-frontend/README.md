# MiniMarket Frontend (Angular 18)

Frontend en Angular que consume la API REST del backend Spring Boot MiniMarket.

## Requisitos
- Node.js 20+
- npm 10+

## Instalación
```bash
cd minimarket-frontend
npm install
```

## Ejecutar
```bash
npm start
# Abrir: http://localhost:4200/
```

El proxy en `src/proxy.conf.json` redirige `/api/**` a `http://localhost:8080`.

## Backend requerido
El backend Spring Boot MiniMarket debe estar corriendo en `http://localhost:8080`.

## Componentes
- `pages/inicio` - Página principal
- `pages/clientes` - Lista de clientes (GET /api/clientes)
- `pages/productos` - Lista de productos (GET /api/productos)
- `pages/cajeros` - Lista de cajeros activos (GET /api/cajeros)
- `pages/ventas` - Lista + creación de ventas (POST /api/ventas)

## Estados de una venta
```
PENDIENTE → EN_PROCESO → FINALIZADA
    │
    └──→ CANCELADA
```

## Usuarios (creados automáticamente por el backend)
| Usuario   | Contraseña     | Rol       |
|-----------|----------------|-----------|
| admin     | admin123       | ADMIN     |
| cajero    | cajero123      | CAJERO    |
| reponedor | reponedor123   | REPONEDOR |
