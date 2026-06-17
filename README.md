# mi-tienda-api

**API REST para plataformas de comercio electrónico multi-tienda, desplegada en Cloudflare Workers.**

Permite a cualquier usuario crear y gestionar su propia tienda en línea: productos con variantes e imágenes, categorías jerárquicas, cupones de descuento, carrito de compras (autenticado o como invitado), checkout, pedidos, métodos de pago y envío, estadísticas y administración de permisos basada en roles.

---

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución local](#ejecución-local)
- [Base de datos](#base-de-datos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Endpoints de la API](#endpoints-de-la-api)
- [Formato de respuesta](#formato-de-respuesta)
- [Tests](#tests)
- [Deploy](#deploy)
- [Contribución](#contribución)

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Runtime | [Cloudflare Workers](https://workers.cloudflare.com/) |
| Framework HTTP | [Hono](https://hono.dev/) v4 |
| Base de datos | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite serverless) |
| ORM / migraciones | [Drizzle ORM](https://orm.drizzle.team/) + Drizzle Kit |
| Sesiones | [Cloudflare KV](https://developers.cloudflare.com/kv/) (dos namespaces: usuarios y clientes) |
| Almacenamiento de archivos | [Cloudflare R2](https://developers.cloudflare.com/r2/) (logos e imágenes de productos) |
| Autenticación | Magic links + OAuth 2.0 (Google y GitHub) |
| Envío de email | [Resend](https://resend.com/) |
| Validación | [Zod](https://zod.dev/) v4 |
| Lenguaje | TypeScript |
| Tests | [Vitest](https://vitest.dev/) + `@cloudflare/vitest-pool-workers` |
| CLI de despliegue | [Wrangler](https://developers.cloudflare.com/workers/wrangler/) v4 |

---

## Requisitos previos

- **Node.js** >= 18
- **npm** >= 9
- Una cuenta de **Cloudflare** con acceso a Workers, D1, KV y R2
- Una cuenta de **Resend** para el envío de magic links por email
- Credenciales OAuth de **Google** y/o **GitHub** (opcionales si no se usa ese flujo de autenticación)

---

## Instalación

```bash
git clone <url-del-repositorio>
cd mi-tienda-api
npm install
```

---

## Variables de entorno

Para desarrollo local, las variables sensibles se inyectan a través del archivo `.dev.vars` (equivalente a `.env` en el ecosistema Wrangler). Copia el ejemplo y rellena los valores:

```bash
cp .dev.vars.example .dev.vars
```

| Variable | Descripción | Requerida |
|---|---|---|
| `GOOGLE_CLIENT_ID` | ID de cliente OAuth de Google | Solo si se usa login con Google |
| `GOOGLE_CLIENT_SECRET` | Secreto OAuth de Google | Solo si se usa login con Google |
| `GITHUB_CLIENT_ID` | ID de cliente OAuth de GitHub | Solo si se usa login con GitHub |
| `GITHUB_CLIENT_SECRET` | Secreto OAuth de GitHub | Solo si se usa login con GitHub |
| `RESEND_API_KEY` | API key de Resend para enviar magic links | Sí |

Las siguientes variables **no son secretos** y ya están configuradas en `wrangler.jsonc` por entorno:

| Variable | Desarrollo | Producción |
|---|---|---|
| `BASE_URL` | `http://localhost:8787` | `https://api-mitienda.franciscosolis.cl` |
| `R2_PUBLIC_URL` | `https://assets-mitienda-dev.franciscosolis.cl` | `https://assets-mitienda.franciscosolis.cl` |
| `EMAIL_FROM` | `miTienda <no-reply@mitienda.local>` | `miTienda <noreply@franciscosolis.cl>` |
| `EMAIL_PROVIDER` | `resend` | `resend` |
| `OAUTH_REDIRECT_BASE` | `http://localhost:8787` | `https://api-mitienda.franciscosolis.cl` |

En producción, los secretos se configuran con Wrangler (no se suben al repositorio):

```bash
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put RESEND_API_KEY
```

---

## Ejecución local

### 1. Aplicar migraciones en la base de datos local

```bash
npm run db:migrate:local
```

Esto aplica todas las migraciones SQL de `drizzle/migrations/` a la instancia local de D1 administrada por Wrangler.

### 2. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La API queda disponible en `http://localhost:8787`.

Endpoints de verificación rápida:

```
GET http://localhost:8787/
GET http://localhost:8787/api/health
```

---

## Base de datos

El esquema se define en `src/db/schema/` usando Drizzle ORM y SQLite a través de Cloudflare D1.

### Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run db:generate` | Genera nuevos archivos SQL de migración a partir del esquema TypeScript |
| `npm run db:migrate:local` | Aplica las migraciones en la base de datos D1 local |
| `npm run db:migrate:remote` | Aplica las migraciones en la base de datos D1 remota (producción) |
| `npm run cf-typegen` | Regenera los tipos TypeScript de los bindings de Cloudflare |

### Seed inicial

El archivo `drizzle/seed.sql` contiene datos iniciales opcionales para poblar la base de datos local durante el desarrollo.

### Modelo de datos principal

```
users ──< stores ──< products ──< product_variants
                  ──< categories
                  ──< coupons
                  ──< orders ──< order_items
                  ──< carts ──< cart_items
                  ──< payment_methods
                  ──< shipping_methods
customers ──< customer_addresses
```

---

## Estructura del proyecto

```
mi-tienda-api/
├── src/
│   ├── index.ts              # Punto de entrada: monta routers y manejo global de errores
│   ├── db/
│   │   ├── index.ts          # Cliente Drizzle
│   │   └── schema/           # Esquema de tablas (Drizzle ORM)
│   ├── lib/
│   │   ├── crypto.ts         # Utilidades criptográficas
│   │   ├── email.ts          # Envío de emails vía Resend
│   │   ├── errors.ts         # Clase AppError centralizada
│   │   ├── jsend.ts          # Helpers de formato JSend
│   │   ├── magic-link.ts     # Generación y verificación de magic links
│   │   ├── oauth.ts          # Flujo OAuth 2.0 (Google / GitHub)
│   │   ├── r2.ts             # Operaciones sobre Cloudflare R2
│   │   ├── session.ts        # Gestión de sesiones en KV
│   │   ├── upload.ts         # Procesamiento de archivos subidos
│   │   └── validation.ts     # Helpers de parseo con Zod
│   ├── middleware/
│   │   ├── auth.ts           # Autenticación de usuarios (admin/dueño de tienda)
│   │   ├── customer-auth.ts  # Autenticación de clientes finales
│   │   ├── db.ts             # Inyección del cliente de base de datos por request
│   │   ├── permissions.ts    # RBAC: verifica permisos del usuario
│   │   └── store-context.ts  # Resuelve y valida la tienda del request
│   ├── routes/               # Definición de rutas (una por recurso)
│   ├── services/             # Lógica de negocio (una por recurso)
│   ├── validators/           # Schemas Zod de validación de entrada
│   └── types/
│       └── index.ts          # Tipos globales (AppEnv, Variables de Hono)
├── drizzle/
│   ├── migrations/           # Archivos SQL generados por Drizzle Kit
│   └── seed.sql              # Datos de seed para desarrollo
├── test/                     # Tests de integración con Miniflare
├── drizzle.config.ts         # Configuración de Drizzle Kit
├── vitest.config.ts          # Configuración de Vitest + Workers pool
├── wrangler.jsonc            # Configuración de Cloudflare Workers / Wrangler
└── .dev.vars.example         # Plantilla de secretos para desarrollo local
```

---

## Endpoints de la API

Todas las respuestas siguen el formato [JSend](#formato-de-respuesta). Los endpoints marcados con `[Auth]` requieren el header `Authorization: Bearer <token>` de sesión de usuario (dueño de tienda). Los marcados con `[Customer Auth]` requieren un token de sesión de cliente final.

### Salud

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Estado de la API |
| `GET` | `/api/health` | Health check con timestamp |

### Autenticación de usuarios (`/api/auth`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/auth/oauth/:provider` | Inicia flujo OAuth (Google / GitHub) |
| `GET` | `/api/auth/oauth/:provider/callback` | Callback OAuth, devuelve token de sesión |
| `POST` | `/api/auth/magic-link` | Envía magic link al email indicado |
| `GET` | `/api/auth/magic-link/verify` | Verifica el token del magic link |
| `POST` | `/api/auth/logout` | `[Auth]` Cierra la sesión activa |
| `GET` | `/api/auth/me` | `[Auth]` Devuelve el usuario autenticado |

### Autenticación de clientes (`/api/auth/customer`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/auth/customer/oauth/:provider` | Inicia flujo OAuth para cliente final |
| `GET` | `/api/auth/customer/oauth/:provider/callback` | Callback OAuth de cliente |
| `POST` | `/api/auth/customer/magic-link` | Envía magic link a un cliente |
| `GET` | `/api/auth/customer/magic-link/verify` | Verifica magic link de cliente |
| `POST` | `/api/auth/customer/logout` | `[Customer Auth]` Cierra sesión de cliente |
| `GET` | `/api/auth/customer/me` | `[Customer Auth]` Devuelve el cliente autenticado |

### Perfil de usuario (`/api/users`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/users/me` | `[Auth]` Perfil del usuario |
| `PATCH` | `/api/users/me` | `[Auth]` Actualiza nombre / avatar |
| `DELETE` | `/api/users/me` | `[Auth]` Elimina cuenta y tiendas asociadas |

### Perfil de cliente (`/api/customers`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/customers/me` | `[Customer Auth]` Perfil del cliente |
| `PATCH` | `/api/customers/me` | `[Customer Auth]` Actualiza datos del cliente |
| `GET` | `/api/customers/me/addresses` | `[Customer Auth]` Lista de direcciones |
| `POST` | `/api/customers/me/addresses` | `[Customer Auth]` Agrega una dirección |
| `PATCH` | `/api/customers/me/addresses/:id` | `[Customer Auth]` Actualiza una dirección |
| `DELETE` | `/api/customers/me/addresses/:id` | `[Customer Auth]` Elimina una dirección |
| `GET` | `/api/customers/me/orders` | `[Customer Auth]` Historial de pedidos |
| `GET` | `/api/customers/me/orders/:id` | `[Customer Auth]` Detalle de un pedido |

### Tiendas (`/api/stores`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/stores` | `[Auth]` Lista las tiendas del usuario |
| `POST` | `/api/stores` | `[Auth]` Crea una nueva tienda |
| `GET` | `/api/stores/:storeId` | `[Auth]` Detalle de una tienda |
| `PATCH` | `/api/stores/:storeId` | `[Auth]` Actualiza datos de la tienda |
| `DELETE` | `/api/stores/:storeId` | `[Auth]` Elimina la tienda y sus recursos |
| `GET` | `/api/stores/:storeId/settings` | `[Auth]` Configuración de la tienda |
| `PATCH` | `/api/stores/:storeId/settings` | `[Auth]` Actualiza configuración (moneda, impuestos, etc.) |
| `POST` | `/api/stores/:storeId/logo` | `[Auth]` Sube el logo de la tienda (multipart) |

### Productos (`/api/stores/:storeId/products`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `.../products` | `[Auth]` Lista productos (con filtros) |
| `POST` | `.../products` | `[Auth]` Crea un producto |
| `GET` | `.../products/:id` | `[Auth]` Detalle de un producto |
| `PATCH` | `.../products/:id` | `[Auth]` Actualiza un producto |
| `DELETE` | `.../products/:id` | `[Auth]` Elimina un producto y sus imágenes |
| `POST` | `.../products/:id/images` | `[Auth]` Sube imágenes del producto (multipart) |
| `DELETE` | `.../products/:id/images/:imageId` | `[Auth]` Elimina una imagen |
| `PATCH` | `.../products/:id/images/:imageId/main` | `[Auth]` Establece imagen principal |
| `POST` | `.../products/:id/variants` | `[Auth]` Agrega una variante |
| `PATCH` | `.../products/:id/variants/:variantId` | `[Auth]` Actualiza una variante |
| `DELETE` | `.../products/:id/variants/:variantId` | `[Auth]` Elimina una variante |

### Categorías (`/api/stores/:storeId/categories`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `.../categories` | `[Auth]` Árbol de categorías de la tienda |
| `POST` | `.../categories` | `[Auth]` Crea una categoría (acepta `parentId`) |
| `PATCH` | `.../categories/:id` | `[Auth]` Actualiza una categoría |
| `DELETE` | `.../categories/:id` | `[Auth]` Elimina una categoría (`?recursive=true` para subcategorías) |

### Cupones (`/api/stores/:storeId/coupons`)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `.../coupons/validate` | Público: valida un código de cupón |
| `GET` | `.../coupons` | `[Auth]` Lista cupones |
| `POST` | `.../coupons` | `[Auth]` Crea un cupón |
| `GET` | `.../coupons/:id` | `[Auth]` Detalle de un cupón |
| `PATCH` | `.../coupons/:id` | `[Auth]` Actualiza un cupón |
| `DELETE` | `.../coupons/:id` | `[Auth]` Elimina un cupón |

### Carrito (`/api/stores/:storeId/cart`)

El carrito funciona para clientes autenticados y para invitados (guest token).

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `.../cart` | Crea un carrito |
| `GET` | `.../cart/:cartId` | Obtiene el carrito |
| `POST` | `.../cart/:cartId/items` | Agrega un ítem |
| `PATCH` | `.../cart/:cartId/items/:itemId` | Actualiza cantidad de un ítem |
| `DELETE` | `.../cart/:cartId/items/:itemId` | Elimina un ítem |
| `POST` | `.../cart/:cartId/coupon` | Aplica un cupón al carrito |
| `DELETE` | `.../cart/:cartId/coupon` | Remueve el cupón del carrito |
| `POST` | `.../cart/:cartId/checkout` | Realiza el checkout y crea el pedido |

### Carritos — vista admin (`/api/stores/:storeId/carts`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `.../carts` | `[Auth]` Lista todos los carritos de la tienda |
| `GET` | `.../carts/:id` | `[Auth]` Detalle de un carrito |

### Pedidos (`/api/stores/:storeId/orders`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `.../orders` | `[Auth]` Lista pedidos (con filtros) |
| `GET` | `.../orders/:id` | `[Auth]` Detalle de un pedido |
| `PATCH` | `.../orders/:id/status` | `[Auth]` Actualiza el estado del pedido |

### Métodos de pago (`/api/stores/:storeId/payments`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `.../payments/methods` | `[Auth]` Lista métodos de pago |
| `POST` | `.../payments/methods` | `[Auth]` Crea un método de pago |
| `PATCH` | `.../payments/methods/:id` | `[Auth]` Actualiza un método de pago |
| `DELETE` | `.../payments/methods/:id` | `[Auth]` Elimina un método de pago |

### Métodos de envío (`/api/stores/:storeId/shipping`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `.../shipping/methods` | `[Auth]` Lista métodos de envío |
| `POST` | `.../shipping/methods` | `[Auth]` Crea un método de envío |
| `PATCH` | `.../shipping/methods/:id` | `[Auth]` Actualiza un método de envío |
| `DELETE` | `.../shipping/methods/:id` | `[Auth]` Elimina un método de envío |

### Clientes de la tienda — vista admin (`/api/stores/:storeId/customers`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `.../customers` | `[Auth]` Lista clientes de la tienda |
| `GET` | `.../customers/:id` | `[Auth]` Detalle de un cliente |

### Estadísticas (`/api/stores/:storeId/stats`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `.../stats/summary` | `[Auth]` Resumen general (`?from=&to=`) |
| `GET` | `.../stats/top-products` | `[Auth]` Productos más vendidos |
| `GET` | `.../stats/orders-by-status` | `[Auth]` Pedidos agrupados por estado |
| `GET` | `.../stats/revenue-over-time` | `[Auth]` Ingresos en el tiempo (`?interval=day\|week\|month`) |

### Administración del sistema (`/api/admin`)

Requiere autenticación de usuario con los permisos de sistema correspondientes (RBAC).

| Método | Ruta | Permiso requerido | Descripción |
|---|---|---|---|
| `GET` | `/api/admin/users` | `user.view` | Lista todos los usuarios |
| `GET` | `/api/admin/users/:id` | `user.view` | Detalle de un usuario |
| `PATCH` | `/api/admin/users/:id/roles` | `user.manage_roles` | Asigna / remueve roles |
| `GET` | `/api/admin/roles` | `role.view` | Lista roles del sistema |
| `GET` | `/api/admin/permissions` | `permission.view` | Lista permisos del sistema |
| `POST` | `/api/admin/roles/:id/permissions` | `role.manage_permissions` | Asigna un permiso a un rol |
| `DELETE` | `/api/admin/roles/:id/permissions/:permId` | `role.manage_permissions` | Remueve un permiso de un rol |

---

## Formato de respuesta

Todos los endpoints siguen la especificación [JSend](https://github.com/omniti-labs/jsend):

**Exito (`2xx`)**

```json
{
  "status": "success",
  "data": { ... }
}
```

**Error de cliente (`4xx`)** — datos de validación o regla de negocio fallida

```json
{
  "status": "fail",
  "data": { "campo": "descripción del error" },
  "message": "Mensaje legible (opcional)"
}
```

**Error del servidor (`5xx`)**

```json
{
  "status": "error",
  "message": "Internal Server Error"
}
```

---

## Tests

Los tests de integración corren en un entorno Miniflare real (mismo runtime que Cloudflare Workers) con una base de datos D1 en memoria y las migraciones aplicadas automáticamente antes de cada suite.

```bash
# Ejecutar todos los tests una vez
npm run test

# Modo watch (re-ejecuta al guardar cambios)
npm run test:watch
```

Las suites cubren:

- `auth-magic-link.test.ts` — flujo completo de magic link para usuarios y clientes
- `auth-oauth.test.ts` — flujo OAuth con providers simulados
- `checkout.test.ts` — carrito, cupones y proceso de checkout
- `coupons.test.ts` — creación, validación y restricciones de cupones
- `permissions.test.ts` — sistema RBAC
- `products.test.ts` — CRUD de productos, variantes e imágenes
- `stores.test.ts` — gestión de tiendas y configuración

Para verificar tipos sin ejecutar los tests:

```bash
npm run typecheck
```

---

## Deploy

El proyecto se despliega en Cloudflare Workers usando Wrangler.

### 1. Autenticarse en Cloudflare

```bash
npx wrangler login
```

### 2. Aplicar migraciones en producción

```bash
npm run db:migrate:remote
```

### 3. Configurar secretos de producción

```bash
wrangler secret put GOOGLE_CLIENT_ID --env prod
wrangler secret put GOOGLE_CLIENT_SECRET --env prod
wrangler secret put GITHUB_CLIENT_ID --env prod
wrangler secret put GITHUB_CLIENT_SECRET --env prod
wrangler secret put RESEND_API_KEY --env prod
```

### 4. Desplegar

```bash
npm run deploy
```

Este comando ejecuta `wrangler deploy --minify`, que empaqueta, minifica y publica el Worker en el entorno de producción definido en `wrangler.jsonc`.

> El entorno `prod` está configurado en `wrangler.jsonc` con las URLs de producción y el bucket R2 de producción (`mi-tienda-assets`).

---

## Contribucion

1. Haz un fork del repositorio
2. Crea una rama para tu cambio: `git checkout -b feat/mi-funcionalidad`
3. Realiza tus cambios y asegurate de que los tests pasan: `npm run test`
4. Verifica que no hay errores de tipos: `npm run typecheck`
5. Haz commit siguiendo el estilo [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m "feat: agrega soporte para X"`
6. Abre un Pull Request describiendo el problema que resuelves y como lo probaste

---

<div align="center">
Hecho con cafe por <a href="https://franciscosolis.cl">Fran</a>
</div>
