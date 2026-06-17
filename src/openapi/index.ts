import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";
import { parameters, responses, schemas, securitySchemes } from "./components";
import { paths } from "./paths";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Mi Tienda API",
    version: "1.0.0",
    description: [
      "API REST para el sistema de e-commerce multi-tienda **Mi Tienda**.",
      "",
      "## Autenticación",
      "La API usa dos sistemas de sesión independientes:",
      "- **userAuth** — para propietarios de tiendas y administradores de plataforma.",
      "  Obtener token desde `/api/auth/magic-link` o `/api/auth/oauth/{provider}`.",
      "- **customerAuth** — para clientes compradores.",
      "  Obtener token desde `/api/auth/customer/magic-link` o `/api/auth/customer/oauth/{provider}`.",
      "",
      "Ambos se envían en el header `Authorization: Bearer <token>`.",
      "",
      "Para carritos de invitado, usar el header `X-Guest-Token: <token>` devuelto al crear el carrito.",
      "",
      "## Formato de respuestas",
      "Todas las respuestas siguen el formato **JSend**:",
      "- `{ status: 'success', data: {...} }` — petición exitosa.",
      "- `{ status: 'fail', data: {...}, message: '...' }` — error del cliente (4xx).",
      "- `{ status: 'error', message: '...' }` — error del servidor (5xx).",
      "",
      "## Montos monetarios",
      "Todos los precios y montos están en **unidades menores** (ej: centavos). Dividir por 100 para mostrar.",
      "",
      "## Timestamps",
      "Todos los campos `createdAt` y `updatedAt` son **Unix timestamps en segundos**.",
    ].join("\n"),
    contact: {
      name: "Francisco Solis",
      email: "f.solism@icloud.com",
    },
  },
  tags: [
    { name: "Health", description: "Estado del servicio" },
    { name: "Auth", description: "Autenticación de usuarios propietarios de tiendas" },
    { name: "Auth — Clientes", description: "Autenticación de clientes compradores" },
    { name: "Usuarios", description: "Gestión del perfil del usuario propietario" },
    { name: "Admin", description: "Administración de la plataforma (roles y permisos)" },
    { name: "Tiendas", description: "CRUD de tiendas y su configuración" },
    { name: "Productos", description: "Gestión de productos, variantes e imágenes" },
    { name: "Categorías", description: "Árbol de categorías por tienda" },
    { name: "Cupones", description: "Gestión y validación de cupones de descuento" },
    { name: "Carrito", description: "Carrito de compras público (clientes y guests)" },
    { name: "Carritos (Admin)", description: "Consulta de carritos desde el panel de la tienda" },
    { name: "Órdenes", description: "Gestión de órdenes desde el panel de la tienda" },
    { name: "Clientes (Admin)", description: "Consulta de clientes desde el panel de la tienda" },
    { name: "Perfil del Cliente", description: "Perfil, direcciones y órdenes del cliente autenticado" },
    { name: "Métodos de Pago", description: "Configuración de métodos de pago por tienda" },
    { name: "Métodos de Envío", description: "Configuración de métodos de envío por tienda" },
    { name: "Estadísticas", description: "Analytics y reportes de la tienda" },
  ],
  components: {
    securitySchemes,
    schemas,
    parameters,
    responses,
  },
  paths,
};

export const openApiRouter = new Hono();

openApiRouter.get("/openapi.json", (c) => c.json(spec));

openApiRouter.get(
  "/docs",
  swaggerUI({
    url: "/api/openapi.json",
    title: "Mi Tienda API — Documentación",
  }),
);
