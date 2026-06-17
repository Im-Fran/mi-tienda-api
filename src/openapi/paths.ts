// OpenAPI 3.1 path definitions — organizados por dominio.

const storeIdParam = { $ref: "#/components/parameters/StoreId" };
const pageParam = { $ref: "#/components/parameters/Page" };
const perPageParam = { $ref: "#/components/parameters/PerPage" };

const r401 = { $ref: "#/components/responses/Unauthorized" };
const r403 = { $ref: "#/components/responses/Forbidden" };
const r404 = { $ref: "#/components/responses/NotFound" };
const r422 = { $ref: "#/components/responses/UnprocessableEntity" };
const r500 = { $ref: "#/components/responses/InternalError" };

function jsendSuccess(dataSchema: object, description = "OK") {
  return {
    description,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["success"] },
            data: dataSchema,
          },
          required: ["status", "data"],
        },
      },
    },
  };
}

// ─── Health ────────────────────────────────────────────────────────────────

const healthPaths = {
  "/": {
    get: {
      tags: ["Health"],
      summary: "Raíz",
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            name: { type: "string" },
            status: { type: "string" },
          },
        }),
      },
    },
  },
  "/api/health": {
    get: {
      tags: ["Health"],
      summary: "Health check",
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            status: { type: "string" },
            time: { type: "string", format: "date-time" },
          },
        }),
      },
    },
  },
};

// ─── Auth (usuarios propietarios) ─────────────────────────────────────────

const authPaths = {
  "/api/auth/oauth/{provider}": {
    get: {
      tags: ["Auth"],
      summary: "Iniciar flujo OAuth",
      description: "Redirige al proveedor OAuth para autenticar un usuario propietario.",
      parameters: [
        {
          name: "provider",
          in: "path",
          required: true,
          schema: { type: "string", enum: ["google", "github"] },
        },
      ],
      responses: {
        "302": { description: "Redirección al proveedor OAuth." },
        "422": r422,
      },
    },
  },
  "/api/auth/oauth/{provider}/callback": {
    get: {
      tags: ["Auth"],
      summary: "Callback OAuth",
      description: "El proveedor redirige aquí con `code` y `state`. Devuelve token de sesión.",
      parameters: [
        {
          name: "provider",
          in: "path",
          required: true,
          schema: { type: "string", enum: ["google", "github"] },
        },
        { name: "code", in: "query", required: true, schema: { type: "string" } },
        { name: "state", in: "query", required: true, schema: { type: "string" } },
      ],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            token: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
          required: ["token", "user"],
        }),
        "400": { description: "State inválido o expirado.", content: { "application/json": { schema: { $ref: "#/components/schemas/JSendFail" } } } },
        "500": r500,
      },
    },
  },
  "/api/auth/magic-link": {
    post: {
      tags: ["Auth"],
      summary: "Enviar magic link",
      description: "Envía un enlace de acceso al email indicado. Siempre responde con éxito para evitar enumeración de usuarios.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { email: { type: "string", format: "email" } },
              required: ["email"],
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: { sent: { type: "boolean" } },
        }, "Magic link enviado (si el email existe)."),
        "422": r422,
      },
    },
  },
  "/api/auth/magic-link/verify": {
    get: {
      tags: ["Auth"],
      summary: "Verificar magic link",
      description: "Consume el token del magic link y devuelve un token de sesión.",
      parameters: [
        { name: "token", in: "query", required: true, schema: { type: "string" } },
        { name: "email", in: "query", required: true, schema: { type: "string", format: "email" } },
      ],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            token: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
          required: ["token", "user"],
        }),
        "400": { description: "Token inválido, expirado o ya usado.", content: { "application/json": { schema: { $ref: "#/components/schemas/JSendFail" } } } },
      },
    },
  },
  "/api/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Cerrar sesión de usuario",
      security: [{ userAuth: [] }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { loggedOut: { type: "boolean" } } }),
        "401": r401,
      },
    },
  },
  "/api/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Perfil del usuario autenticado",
      security: [{ userAuth: [] }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { user: { $ref: "#/components/schemas/User" } }, required: ["user"] }),
        "401": r401,
      },
    },
  },
};

// ─── Auth (clientes compradores) ──────────────────────────────────────────

const authCustomerPaths = {
  "/api/auth/customer/oauth/{provider}": {
    get: {
      tags: ["Auth — Clientes"],
      summary: "Iniciar OAuth para cliente",
      parameters: [
        {
          name: "provider",
          in: "path",
          required: true,
          schema: { type: "string", enum: ["google", "github"] },
        },
      ],
      responses: {
        "302": { description: "Redirección al proveedor OAuth." },
        "422": r422,
      },
    },
  },
  "/api/auth/customer/oauth/{provider}/callback": {
    get: {
      tags: ["Auth — Clientes"],
      summary: "Callback OAuth para cliente",
      parameters: [
        {
          name: "provider",
          in: "path",
          required: true,
          schema: { type: "string", enum: ["google", "github"] },
        },
        { name: "code", in: "query", required: true, schema: { type: "string" } },
        { name: "state", in: "query", required: true, schema: { type: "string" } },
      ],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            token: { type: "string" },
            customer: { $ref: "#/components/schemas/Customer" },
          },
          required: ["token", "customer"],
        }),
        "400": { description: "State inválido.", content: { "application/json": { schema: { $ref: "#/components/schemas/JSendFail" } } } },
      },
    },
  },
  "/api/auth/customer/magic-link": {
    post: {
      tags: ["Auth — Clientes"],
      summary: "Enviar magic link para cliente",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { email: { type: "string", format: "email" } },
              required: ["email"],
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { sent: { type: "boolean" } } }),
        "422": r422,
      },
    },
  },
  "/api/auth/customer/magic-link/verify": {
    get: {
      tags: ["Auth — Clientes"],
      summary: "Verificar magic link de cliente",
      parameters: [
        { name: "token", in: "query", required: true, schema: { type: "string" } },
        { name: "email", in: "query", required: true, schema: { type: "string", format: "email" } },
      ],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            token: { type: "string" },
            customer: { $ref: "#/components/schemas/Customer" },
          },
          required: ["token", "customer"],
        }),
        "400": { description: "Token inválido.", content: { "application/json": { schema: { $ref: "#/components/schemas/JSendFail" } } } },
      },
    },
  },
  "/api/auth/customer/logout": {
    post: {
      tags: ["Auth — Clientes"],
      summary: "Cerrar sesión de cliente",
      security: [{ customerAuth: [] }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { loggedOut: { type: "boolean" } } }),
        "401": r401,
      },
    },
  },
  "/api/auth/customer/me": {
    get: {
      tags: ["Auth — Clientes"],
      summary: "Perfil del cliente autenticado",
      security: [{ customerAuth: [] }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { customer: { $ref: "#/components/schemas/Customer" } }, required: ["customer"] }),
        "401": r401,
      },
    },
  },
};

// ─── Users ─────────────────────────────────────────────────────────────────

const usersPaths = {
  "/api/users/me": {
    get: {
      tags: ["Usuarios"],
      summary: "Obtener perfil propio",
      security: [{ userAuth: [] }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { user: { $ref: "#/components/schemas/User" } }, required: ["user"] }),
        "401": r401,
      },
    },
    patch: {
      tags: ["Usuarios"],
      summary: "Actualizar perfil propio",
      security: [{ userAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", minLength: 1, maxLength: 120 },
                avatarUrl: { type: "string", format: "uri" },
              },
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { user: { $ref: "#/components/schemas/User" } }, required: ["user"] }),
        "401": r401,
        "422": r422,
      },
    },
    delete: {
      tags: ["Usuarios"],
      summary: "Eliminar cuenta y todas sus tiendas",
      security: [{ userAuth: [] }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { deleted: { type: "boolean" } } }),
        "401": r401,
      },
    },
  },
};

// ─── Admin ─────────────────────────────────────────────────────────────────

const adminPaths = {
  "/api/admin/users": {
    get: {
      tags: ["Admin"],
      summary: "Listar usuarios de la plataforma",
      description: "Requiere permiso `user.view`.",
      security: [{ userAuth: [] }],
      parameters: [pageParam, perPageParam],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            users: { type: "array", items: { $ref: "#/components/schemas/User" } },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        }),
        "401": r401,
        "403": r403,
      },
    },
  },
  "/api/admin/users/{id}": {
    get: {
      tags: ["Admin"],
      summary: "Detalle de usuario",
      description: "Requiere permiso `user.view`.",
      security: [{ userAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { user: { $ref: "#/components/schemas/User" } }, required: ["user"] }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
  "/api/admin/users/{id}/roles": {
    patch: {
      tags: ["Admin"],
      summary: "Asignar / quitar roles a un usuario",
      description: "Requiere permiso `user.manage_roles`.",
      security: [{ userAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                add: { type: "array", items: { type: "string" }, default: [] },
                remove: { type: "array", items: { type: "string" }, default: [] },
              },
              description: "Al menos uno de `add` o `remove` debe tener elementos.",
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { user: { $ref: "#/components/schemas/User" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
        "422": r422,
      },
    },
  },
  "/api/admin/roles": {
    get: {
      tags: ["Admin"],
      summary: "Listar roles del sistema",
      description: "Requiere permiso `role.view`.",
      security: [{ userAuth: [] }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { roles: { type: "array", items: { $ref: "#/components/schemas/SystemRole" } } } }),
        "401": r401,
        "403": r403,
      },
    },
  },
  "/api/admin/permissions": {
    get: {
      tags: ["Admin"],
      summary: "Listar permisos del sistema",
      description: "Requiere permiso `permission.view`.",
      security: [{ userAuth: [] }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { permissions: { type: "array", items: { $ref: "#/components/schemas/SystemPermission" } } } }),
        "401": r401,
        "403": r403,
      },
    },
  },
  "/api/admin/roles/{id}/permissions": {
    post: {
      tags: ["Admin"],
      summary: "Asignar permiso a un rol",
      description: "Requiere permiso `role.manage_permissions`.",
      security: [{ userAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { permissionId: { type: "string" } },
              required: ["permissionId"],
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object" }),
        "401": r401,
        "403": r403,
        "404": r404,
        "422": r422,
      },
    },
  },
  "/api/admin/roles/{id}/permissions/{permId}": {
    delete: {
      tags: ["Admin"],
      summary: "Quitar permiso de un rol",
      description: "Requiere permiso `role.manage_permissions`.",
      security: [{ userAuth: [] }],
      parameters: [
        { $ref: "#/components/parameters/ResourceId" },
        { name: "permId", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { removed: { type: "boolean" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
};

// ─── Stores ─────────────────────────────────────────────────────────────────

const storesPaths = {
  "/api/stores": {
    get: {
      tags: ["Tiendas"],
      summary: "Listar tiendas del usuario",
      security: [{ userAuth: [] }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { stores: { type: "array", items: { $ref: "#/components/schemas/Store" } } }, required: ["stores"] }),
        "401": r401,
      },
    },
    post: {
      tags: ["Tiendas"],
      summary: "Crear tienda",
      description: "Un usuario puede tener hasta 3 tiendas.",
      security: [{ userAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", minLength: 1, maxLength: 120 },
                slug: {
                  type: "string",
                  pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                  description: "Si se omite, se genera automáticamente desde el nombre.",
                },
              },
              required: ["name"],
            },
          },
        },
      },
      responses: {
        "201": jsendSuccess({ type: "object", properties: { store: { $ref: "#/components/schemas/Store" } }, required: ["store"] }, "Tienda creada."),
        "401": r401,
        "409": { description: "Slug ya en uso o límite de tiendas alcanzado.", content: { "application/json": { schema: { $ref: "#/components/schemas/JSendFail" } } } },
        "422": r422,
      },
    },
  },
  "/api/stores/{storeId}": {
    get: {
      tags: ["Tiendas"],
      summary: "Obtener tienda",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { store: { $ref: "#/components/schemas/Store" } }, required: ["store"] }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
    patch: {
      tags: ["Tiendas"],
      summary: "Actualizar tienda",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", minLength: 1, maxLength: 120 },
                slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
                isActive: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { store: { $ref: "#/components/schemas/Store" } }, required: ["store"] }),
        "401": r401,
        "403": r403,
        "404": r404,
        "409": { description: "Slug ya en uso.", content: { "application/json": { schema: { $ref: "#/components/schemas/JSendFail" } } } },
        "422": r422,
      },
    },
    delete: {
      tags: ["Tiendas"],
      summary: "Eliminar tienda",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { deleted: { type: "boolean" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
  "/api/stores/{storeId}/settings": {
    get: {
      tags: ["Tiendas"],
      summary: "Obtener configuración de la tienda",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { settings: { $ref: "#/components/schemas/StoreSettings" } }, required: ["settings"] }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
    patch: {
      tags: ["Tiendas"],
      summary: "Actualizar configuración de la tienda",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                requireCustomerIdDocument: { type: "boolean" },
                taxLabel: { type: "string", maxLength: 40 },
                taxRate: { type: "number", minimum: 0, maximum: 100 },
                decimalSeparator: { type: "string", enum: [".", ","] },
                decimalPlaces: { type: "integer", minimum: 0, maximum: 6 },
                currencyCode: { type: "string", minLength: 3, maxLength: 3 },
                currencySymbol: { type: "string", minLength: 1, maxLength: 8 },
                countryMode: { type: "string", enum: ["inclusive", "exclusive"] },
                bankTransferInfo: {
                  type: "object",
                  properties: {
                    bankName: { type: "string" },
                    accountType: { type: "string" },
                    accountNumber: { type: "string" },
                    holderName: { type: "string" },
                    holderDocument: { type: "string" },
                    email: { type: "string", format: "email" },
                    instructions: { type: "string" },
                  },
                },
                countries: {
                  type: "array",
                  items: { type: "string", minLength: 2, maxLength: 2 },
                },
              },
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { settings: { $ref: "#/components/schemas/StoreSettings" } }, required: ["settings"] }),
        "401": r401,
        "403": r403,
        "404": r404,
        "422": r422,
      },
    },
  },
  "/api/stores/{storeId}/logo": {
    post: {
      tags: ["Tiendas"],
      summary: "Subir logo de la tienda",
      description: "Multipart form-data. Campo: `logo` o `file`.",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                logo: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { store: { $ref: "#/components/schemas/Store" } }, required: ["store"] }),
        "400": { description: "Sin archivo adjunto.", content: { "application/json": { schema: { $ref: "#/components/schemas/JSendFail" } } } },
        "401": r401,
        "403": r403,
      },
    },
  },
};

// ─── Products ───────────────────────────────────────────────────────────────

const productsPaths = {
  "/api/stores/{storeId}/products": {
    get: {
      tags: ["Productos"],
      summary: "Listar productos",
      security: [{ userAuth: [] }],
      parameters: [
        storeIdParam,
        { name: "category", in: "query", schema: { type: "string" }, description: "Filtrar por ID de categoría" },
        { name: "type", in: "query", schema: { type: "string", enum: ["physical", "digital"] } },
        { name: "active", in: "query", schema: { type: "string", enum: ["true", "false"] } },
        { name: "search", in: "query", schema: { type: "string" } },
        pageParam,
        perPageParam,
      ],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            products: { type: "array", items: { $ref: "#/components/schemas/Product" } },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        }),
        "401": r401,
        "403": r403,
      },
    },
    post: {
      tags: ["Productos"],
      summary: "Crear producto",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", minLength: 1, maxLength: 200 },
                shortDescription: { type: "string", maxLength: 300 },
                fullDescription: { type: "string", description: "Markdown" },
                type: { type: "string", enum: ["physical", "digital"], default: "physical" },
                isActive: { type: "boolean", default: true },
                categoryIds: { type: "array", items: { type: "string" }, default: [] },
                variants: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", minLength: 1, maxLength: 120 },
                      sku: { type: "string", maxLength: 80 },
                      price: { type: "integer", minimum: 0 },
                      compareAtPrice: { type: "integer", minimum: 0 },
                      stock: { type: "integer", minimum: 0, default: 0 },
                      weight: { type: "integer", minimum: 0 },
                      digitalFileR2Key: { type: "string" },
                      options: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            optionName: { type: "string", minLength: 1, maxLength: 60 },
                            optionValue: { type: "string", minLength: 1, maxLength: 120 },
                          },
                          required: ["optionName", "optionValue"],
                        },
                        default: [],
                      },
                    },
                    required: ["name", "price"],
                  },
                  default: [],
                },
              },
              required: ["name"],
            },
          },
        },
      },
      responses: {
        "201": jsendSuccess({ type: "object", properties: { product: { $ref: "#/components/schemas/Product" } }, required: ["product"] }, "Producto creado."),
        "401": r401,
        "403": r403,
        "422": r422,
      },
    },
  },
  "/api/stores/{storeId}/products/{id}": {
    get: {
      tags: ["Productos"],
      summary: "Obtener producto",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { product: { $ref: "#/components/schemas/Product" } }, required: ["product"] }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
    patch: {
      tags: ["Productos"],
      summary: "Actualizar producto",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", minLength: 1, maxLength: 200 },
                shortDescription: { type: "string", maxLength: 300 },
                fullDescription: { type: "string" },
                type: { type: "string", enum: ["physical", "digital"] },
                isActive: { type: "boolean" },
                categoryIds: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { product: { $ref: "#/components/schemas/Product" } }, required: ["product"] }),
        "401": r401,
        "403": r403,
        "404": r404,
        "422": r422,
      },
    },
    delete: {
      tags: ["Productos"],
      summary: "Eliminar producto",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { deleted: { type: "boolean" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
  "/api/stores/{storeId}/products/{id}/images": {
    post: {
      tags: ["Productos"],
      summary: "Subir imágenes del producto",
      description: "Multipart form-data. Campo: `images` o `image` (múltiples).",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                images: {
                  type: "array",
                  items: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
      },
      responses: {
        "201": jsendSuccess({ type: "object", properties: { images: { type: "array", items: { $ref: "#/components/schemas/ProductImage" } } } }, "Imágenes subidas."),
        "400": { description: "Sin imágenes.", content: { "application/json": { schema: { $ref: "#/components/schemas/JSendFail" } } } },
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
  "/api/stores/{storeId}/products/{id}/images/{imageId}": {
    delete: {
      tags: ["Productos"],
      summary: "Eliminar imagen del producto",
      security: [{ userAuth: [] }],
      parameters: [
        storeIdParam,
        { $ref: "#/components/parameters/ResourceId" },
        { name: "imageId", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { deleted: { type: "boolean" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
  "/api/stores/{storeId}/products/{id}/images/{imageId}/main": {
    patch: {
      tags: ["Productos"],
      summary: "Establecer imagen principal",
      security: [{ userAuth: [] }],
      parameters: [
        storeIdParam,
        { $ref: "#/components/parameters/ResourceId" },
        { name: "imageId", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { product: { $ref: "#/components/schemas/Product" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
  "/api/stores/{storeId}/products/{id}/variants": {
    post: {
      tags: ["Productos"],
      summary: "Agregar variante al producto",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", minLength: 1, maxLength: 120 },
                sku: { type: "string", maxLength: 80 },
                price: { type: "integer", minimum: 0 },
                compareAtPrice: { type: "integer", minimum: 0 },
                stock: { type: "integer", minimum: 0, default: 0 },
                weight: { type: "integer", minimum: 0 },
                digitalFileR2Key: { type: "string" },
                options: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      optionName: { type: "string" },
                      optionValue: { type: "string" },
                    },
                    required: ["optionName", "optionValue"],
                  },
                  default: [],
                },
              },
              required: ["name", "price"],
            },
          },
        },
      },
      responses: {
        "201": jsendSuccess({ type: "object", properties: { variant: { $ref: "#/components/schemas/ProductVariant" } } }, "Variante creada."),
        "401": r401,
        "403": r403,
        "404": r404,
        "422": r422,
      },
    },
  },
  "/api/stores/{storeId}/products/{id}/variants/{variantId}": {
    patch: {
      tags: ["Productos"],
      summary: "Actualizar variante",
      security: [{ userAuth: [] }],
      parameters: [
        storeIdParam,
        { $ref: "#/components/parameters/ResourceId" },
        { name: "variantId", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", minLength: 1, maxLength: 120 },
                sku: { type: "string", maxLength: 80 },
                price: { type: "integer", minimum: 0 },
                compareAtPrice: { type: "integer", minimum: 0 },
                stock: { type: "integer", minimum: 0 },
                weight: { type: "integer", minimum: 0 },
                digitalFileR2Key: { type: "string" },
                options: { type: "array", items: { type: "object", properties: { optionName: { type: "string" }, optionValue: { type: "string" } }, required: ["optionName", "optionValue"] } },
              },
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { variant: { $ref: "#/components/schemas/ProductVariant" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
        "422": r422,
      },
    },
    delete: {
      tags: ["Productos"],
      summary: "Eliminar variante",
      security: [{ userAuth: [] }],
      parameters: [
        storeIdParam,
        { $ref: "#/components/parameters/ResourceId" },
        { name: "variantId", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { deleted: { type: "boolean" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
};

// ─── Categories ─────────────────────────────────────────────────────────────

const categoriesPaths = {
  "/api/stores/{storeId}/categories": {
    get: {
      tags: ["Categorías"],
      summary: "Obtener árbol de categorías",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            categories: { type: "array", items: { $ref: "#/components/schemas/Category" } },
          },
        }),
        "401": r401,
        "403": r403,
      },
    },
    post: {
      tags: ["Categorías"],
      summary: "Crear categoría",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", minLength: 1, maxLength: 120 },
                slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
                description: { type: "string" },
                parentId: { type: "string", description: "ID de la categoría padre" },
                sortOrder: { type: "integer", default: 0 },
              },
              required: ["name"],
            },
          },
        },
      },
      responses: {
        "201": jsendSuccess({ type: "object", properties: { category: { $ref: "#/components/schemas/Category" } } }, "Categoría creada."),
        "401": r401,
        "403": r403,
        "409": { description: "Slug ya en uso en esta tienda.", content: { "application/json": { schema: { $ref: "#/components/schemas/JSendFail" } } } },
        "422": r422,
      },
    },
  },
  "/api/stores/{storeId}/categories/{id}": {
    patch: {
      tags: ["Categorías"],
      summary: "Actualizar categoría",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", minLength: 1, maxLength: 120 },
                slug: { type: "string" },
                description: { type: "string" },
                parentId: { type: "string" },
                sortOrder: { type: "integer" },
              },
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { category: { $ref: "#/components/schemas/Category" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
        "422": r422,
      },
    },
    delete: {
      tags: ["Categorías"],
      summary: "Eliminar categoría",
      security: [{ userAuth: [] }],
      parameters: [
        storeIdParam,
        { $ref: "#/components/parameters/ResourceId" },
        {
          name: "recursive",
          in: "query",
          schema: { type: "string", enum: ["true", "false"], default: "false" },
          description: "Si `true`, elimina subcategorías recursivamente.",
        },
      ],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { deleted: { type: "boolean" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
};

// ─── Coupons ─────────────────────────────────────────────────────────────────

const couponInputSchema = {
  type: "object",
  properties: {
    code: { type: "string", minLength: 1, maxLength: 40 },
    type: { type: "string", enum: ["percentage", "fixed"] },
    value: { type: "integer", minimum: 0, description: "Para percentage: 0-100; para fixed: unidades menores." },
    appliesTo: { type: "string", enum: ["all", "products", "categories"], default: "all" },
    occasion: { type: "string" },
    minOrderAmount: { type: "integer", minimum: 0 },
    maxUses: { type: "integer", minimum: 1 },
    startsAt: { type: "string", format: "date-time" },
    expiresAt: { type: "string", format: "date-time" },
    isActive: { type: "boolean", default: true },
    productIds: { type: "array", items: { type: "string" }, default: [] },
    categoryIds: { type: "array", items: { type: "string" }, default: [] },
  },
  required: ["code", "type", "value"],
};

const couponsPaths = {
  "/api/stores/{storeId}/coupons/validate": {
    post: {
      tags: ["Cupones"],
      summary: "Validar cupón (público)",
      description: "Endpoint público — no requiere autenticación.",
      parameters: [storeIdParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                code: { type: "string", minLength: 1 },
                cartId: { type: "string" },
                subtotal: { type: "integer", minimum: 0 },
              },
              required: ["code"],
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { valid: { type: "boolean" }, coupon: { $ref: "#/components/schemas/Coupon" }, discount: { type: "integer" } } }),
        "404": r404,
        "422": r422,
      },
    },
  },
  "/api/stores/{storeId}/coupons": {
    get: {
      tags: ["Cupones"],
      summary: "Listar cupones",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, pageParam, perPageParam],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            coupons: { type: "array", items: { $ref: "#/components/schemas/Coupon" } },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        }),
        "401": r401,
        "403": r403,
      },
    },
    post: {
      tags: ["Cupones"],
      summary: "Crear cupón",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam],
      requestBody: { required: true, content: { "application/json": { schema: couponInputSchema } } },
      responses: {
        "201": jsendSuccess({ type: "object", properties: { coupon: { $ref: "#/components/schemas/Coupon" } } }, "Cupón creado."),
        "401": r401,
        "403": r403,
        "409": { description: "Código ya en uso en esta tienda.", content: { "application/json": { schema: { $ref: "#/components/schemas/JSendFail" } } } },
        "422": r422,
      },
    },
  },
  "/api/stores/{storeId}/coupons/{id}": {
    get: {
      tags: ["Cupones"],
      summary: "Obtener cupón",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { coupon: { $ref: "#/components/schemas/Coupon" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
    patch: {
      tags: ["Cupones"],
      summary: "Actualizar cupón",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      requestBody: { required: true, content: { "application/json": { schema: { ...couponInputSchema, required: [] } } } },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { coupon: { $ref: "#/components/schemas/Coupon" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
        "422": r422,
      },
    },
    delete: {
      tags: ["Cupones"],
      summary: "Eliminar cupón",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { deleted: { type: "boolean" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
};

// ─── Cart (público) ──────────────────────────────────────────────────────────

const cartPaths = {
  "/api/stores/{storeId}/cart": {
    post: {
      tags: ["Carrito"],
      summary: "Crear carrito",
      description: "Público. Opcionalmente vincula a un cliente autenticado.",
      parameters: [storeIdParam],
      security: [{ customerAuth: [] }, {}],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { customerId: { type: "string" } },
            },
          },
        },
      },
      responses: {
        "201": jsendSuccess({ type: "object", properties: { cart: { $ref: "#/components/schemas/Cart" }, guestToken: { type: "string", description: "Solo presente si el carrito es de invitado." } } }, "Carrito creado."),
        "404": r404,
      },
    },
  },
  "/api/stores/{storeId}/cart/{cartId}": {
    get: {
      tags: ["Carrito"],
      summary: "Obtener carrito",
      description: "Usar el Bearer token del cliente o el header `X-Guest-Token` para acceder.",
      parameters: [
        storeIdParam,
        { name: "cartId", in: "path", required: true, schema: { type: "string" } },
      ],
      security: [{ customerAuth: [] }, {}],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { cart: { $ref: "#/components/schemas/Cart" } }, required: ["cart"] }),
        "403": r403,
        "404": r404,
      },
    },
  },
  "/api/stores/{storeId}/cart/{cartId}/items": {
    post: {
      tags: ["Carrito"],
      summary: "Agregar ítem al carrito",
      parameters: [storeIdParam, { name: "cartId", in: "path", required: true, schema: { type: "string" } }],
      security: [{ customerAuth: [] }, {}],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                variantId: { type: "string" },
                quantity: { type: "integer", minimum: 1, default: 1 },
              },
              required: ["variantId"],
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { cart: { $ref: "#/components/schemas/Cart" } }, required: ["cart"] }),
        "403": r403,
        "404": r404,
        "422": r422,
      },
    },
  },
  "/api/stores/{storeId}/cart/{cartId}/items/{itemId}": {
    patch: {
      tags: ["Carrito"],
      summary: "Actualizar cantidad de ítem",
      parameters: [
        storeIdParam,
        { name: "cartId", in: "path", required: true, schema: { type: "string" } },
        { name: "itemId", in: "path", required: true, schema: { type: "string" } },
      ],
      security: [{ customerAuth: [] }, {}],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", properties: { quantity: { type: "integer", minimum: 1 } }, required: ["quantity"] },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { cart: { $ref: "#/components/schemas/Cart" } }, required: ["cart"] }),
        "403": r403,
        "404": r404,
        "422": r422,
      },
    },
    delete: {
      tags: ["Carrito"],
      summary: "Eliminar ítem del carrito",
      parameters: [
        storeIdParam,
        { name: "cartId", in: "path", required: true, schema: { type: "string" } },
        { name: "itemId", in: "path", required: true, schema: { type: "string" } },
      ],
      security: [{ customerAuth: [] }, {}],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { cart: { $ref: "#/components/schemas/Cart" } }, required: ["cart"] }),
        "403": r403,
        "404": r404,
      },
    },
  },
  "/api/stores/{storeId}/cart/{cartId}/coupon": {
    post: {
      tags: ["Carrito"],
      summary: "Aplicar cupón al carrito",
      parameters: [storeIdParam, { name: "cartId", in: "path", required: true, schema: { type: "string" } }],
      security: [{ customerAuth: [] }, {}],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { type: "object", properties: { code: { type: "string", minLength: 1 } }, required: ["code"] } } },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { cart: { $ref: "#/components/schemas/Cart" } }, required: ["cart"] }),
        "400": { description: "Cupón inválido o no aplicable.", content: { "application/json": { schema: { $ref: "#/components/schemas/JSendFail" } } } },
        "403": r403,
        "404": r404,
      },
    },
    delete: {
      tags: ["Carrito"],
      summary: "Quitar cupón del carrito",
      parameters: [storeIdParam, { name: "cartId", in: "path", required: true, schema: { type: "string" } }],
      security: [{ customerAuth: [] }, {}],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { cart: { $ref: "#/components/schemas/Cart" } }, required: ["cart"] }),
        "403": r403,
        "404": r404,
      },
    },
  },
  "/api/stores/{storeId}/cart/{cartId}/checkout": {
    post: {
      tags: ["Carrito"],
      summary: "Realizar checkout",
      description: "Convierte el carrito en una orden. Para invitados incluir `guest`. Para clientes autenticados usar el Bearer token.",
      parameters: [storeIdParam, { name: "cartId", in: "path", required: true, schema: { type: "string" } }],
      security: [{ customerAuth: [] }, {}],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                guest: {
                  type: "object",
                  properties: {
                    name: { type: "string", minLength: 1, maxLength: 120 },
                    email: { type: "string", format: "email" },
                    phone: { type: "string", maxLength: 40 },
                    idDocument: { type: "string", maxLength: 40 },
                  },
                  required: ["name", "email"],
                },
                documentType: { type: "string", enum: ["receipt", "invoice"], default: "receipt" },
                paymentMethodId: { type: "string" },
                shippingMethodId: { type: "string" },
                billingAddressId: { type: "string", description: "ID de dirección guardada del cliente" },
                shippingAddressId: { type: "string" },
                billingAddress: {
                  type: "object",
                  properties: {
                    label: { type: "string", maxLength: 60 },
                    addressLine1: { type: "string", minLength: 1, maxLength: 200 },
                    addressLine2: { type: "string", maxLength: 200 },
                    city: { type: "string", minLength: 1, maxLength: 120 },
                    state: { type: "string", maxLength: 120 },
                    countryCode: { type: "string", minLength: 2, maxLength: 2 },
                    postalCode: { type: "string", maxLength: 20 },
                  },
                  required: ["addressLine1", "city", "countryCode"],
                },
                shippingAddress: {
                  type: "object",
                  properties: {
                    addressLine1: { type: "string", minLength: 1, maxLength: 200 },
                    city: { type: "string", minLength: 1, maxLength: 120 },
                    countryCode: { type: "string", minLength: 2, maxLength: 2 },
                  },
                  required: ["addressLine1", "city", "countryCode"],
                },
                notes: { type: "string", maxLength: 1000 },
              },
              required: ["paymentMethodId"],
            },
          },
        },
      },
      responses: {
        "201": jsendSuccess({ type: "object", properties: { order: { $ref: "#/components/schemas/Order" } } }, "Orden creada."),
        "400": { description: "Carrito vacío o datos inválidos.", content: { "application/json": { schema: { $ref: "#/components/schemas/JSendFail" } } } },
        "403": r403,
        "404": r404,
        "422": r422,
      },
    },
  },
};

// ─── Carts Admin ─────────────────────────────────────────────────────────────

const cartsAdminPaths = {
  "/api/stores/{storeId}/carts": {
    get: {
      tags: ["Carritos (Admin)"],
      summary: "Listar carritos de la tienda",
      security: [{ userAuth: [] }],
      parameters: [
        storeIdParam,
        { name: "status", in: "query", schema: { type: "string", enum: ["pending", "completed"] } },
        pageParam,
        perPageParam,
      ],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            carts: { type: "array", items: { $ref: "#/components/schemas/Cart" } },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        }),
        "401": r401,
        "403": r403,
      },
    },
  },
  "/api/stores/{storeId}/carts/{id}": {
    get: {
      tags: ["Carritos (Admin)"],
      summary: "Obtener carrito",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { cart: { $ref: "#/components/schemas/Cart" } }, required: ["cart"] }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
};

// ─── Orders ──────────────────────────────────────────────────────────────────

const ordersPaths = {
  "/api/stores/{storeId}/orders": {
    get: {
      tags: ["Órdenes"],
      summary: "Listar órdenes de la tienda",
      security: [{ userAuth: [] }],
      parameters: [
        storeIdParam,
        {
          name: "status",
          in: "query",
          schema: { type: "string", enum: ["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] },
        },
        { name: "customerId", in: "query", schema: { type: "string" } },
        { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
        { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
        pageParam,
        perPageParam,
      ],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            orders: { type: "array", items: { $ref: "#/components/schemas/Order" } },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        }),
        "401": r401,
        "403": r403,
      },
    },
  },
  "/api/stores/{storeId}/orders/{id}": {
    get: {
      tags: ["Órdenes"],
      summary: "Obtener orden",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { order: { $ref: "#/components/schemas/Order" } }, required: ["order"] }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
  "/api/stores/{storeId}/orders/{id}/status": {
    patch: {
      tags: ["Órdenes"],
      summary: "Actualizar estado de la orden",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  enum: ["pending_payment", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"],
                },
                paymentReference: { type: "string", maxLength: 200 },
                notes: { type: "string", maxLength: 1000 },
              },
              required: ["status"],
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { order: { $ref: "#/components/schemas/Order" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
        "422": r422,
      },
    },
  },
};

// ─── Store Customers (Admin) ──────────────────────────────────────────────────

const storeCustomersPaths = {
  "/api/stores/{storeId}/customers": {
    get: {
      tags: ["Clientes (Admin)"],
      summary: "Listar clientes de la tienda",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, pageParam, perPageParam],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            customers: { type: "array", items: { $ref: "#/components/schemas/Customer" } },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        }),
        "401": r401,
        "403": r403,
      },
    },
  },
  "/api/stores/{storeId}/customers/{id}": {
    get: {
      tags: ["Clientes (Admin)"],
      summary: "Obtener cliente de la tienda",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { customer: { $ref: "#/components/schemas/Customer" } }, required: ["customer"] }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
};

// ─── Customer Profile ─────────────────────────────────────────────────────────

const customerProfilePaths = {
  "/api/customers/me": {
    get: {
      tags: ["Perfil del Cliente"],
      summary: "Obtener perfil del cliente autenticado",
      security: [{ customerAuth: [] }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { customer: { $ref: "#/components/schemas/Customer" } }, required: ["customer"] }),
        "401": r401,
      },
    },
    patch: {
      tags: ["Perfil del Cliente"],
      summary: "Actualizar perfil del cliente",
      security: [{ customerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", minLength: 1, maxLength: 120 },
                phone: { type: "string", maxLength: 40 },
                idDocument: { type: "string", maxLength: 40 },
                avatarUrl: { type: "string", format: "uri" },
              },
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { customer: { $ref: "#/components/schemas/Customer" } }, required: ["customer"] }),
        "401": r401,
        "422": r422,
      },
    },
  },
  "/api/customers/me/addresses": {
    get: {
      tags: ["Perfil del Cliente"],
      summary: "Listar direcciones del cliente",
      security: [{ customerAuth: [] }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { addresses: { type: "array", items: { $ref: "#/components/schemas/CustomerAddress" } } } }),
        "401": r401,
      },
    },
    post: {
      tags: ["Perfil del Cliente"],
      summary: "Agregar dirección",
      security: [{ customerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                label: { type: "string", maxLength: 60 },
                addressLine1: { type: "string", minLength: 1, maxLength: 200 },
                addressLine2: { type: "string", maxLength: 200 },
                city: { type: "string", minLength: 1, maxLength: 120 },
                state: { type: "string", maxLength: 120 },
                countryCode: { type: "string", minLength: 2, maxLength: 2 },
                postalCode: { type: "string", maxLength: 20 },
                isDefault: { type: "boolean", default: false },
              },
              required: ["addressLine1", "city", "countryCode"],
            },
          },
        },
      },
      responses: {
        "201": jsendSuccess({ type: "object", properties: { address: { $ref: "#/components/schemas/CustomerAddress" } } }, "Dirección creada."),
        "401": r401,
        "422": r422,
      },
    },
  },
  "/api/customers/me/addresses/{id}": {
    patch: {
      tags: ["Perfil del Cliente"],
      summary: "Actualizar dirección",
      security: [{ customerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                label: { type: "string", maxLength: 60 },
                addressLine1: { type: "string", minLength: 1, maxLength: 200 },
                city: { type: "string", minLength: 1, maxLength: 120 },
                countryCode: { type: "string", minLength: 2, maxLength: 2 },
                isDefault: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { address: { $ref: "#/components/schemas/CustomerAddress" } } }),
        "401": r401,
        "404": r404,
        "422": r422,
      },
    },
    delete: {
      tags: ["Perfil del Cliente"],
      summary: "Eliminar dirección",
      security: [{ customerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { deleted: { type: "boolean" } } }),
        "401": r401,
        "404": r404,
      },
    },
  },
  "/api/customers/me/orders": {
    get: {
      tags: ["Perfil del Cliente"],
      summary: "Listar órdenes del cliente",
      security: [{ customerAuth: [] }],
      parameters: [pageParam, perPageParam],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            orders: { type: "array", items: { $ref: "#/components/schemas/Order" } },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        }),
        "401": r401,
      },
    },
  },
  "/api/customers/me/orders/{id}": {
    get: {
      tags: ["Perfil del Cliente"],
      summary: "Detalle de orden del cliente",
      security: [{ customerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { order: { $ref: "#/components/schemas/Order" } }, required: ["order"] }),
        "401": r401,
        "404": r404,
      },
    },
  },
};

// ─── Payments ──────────────────────────────────────────────────────────────────

const paymentMethodInput = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["in_person", "bank_transfer", "external"] },
    providerName: { type: "string", maxLength: 120 },
    config: { type: "object", additionalProperties: true },
    isActive: { type: "boolean", default: true },
  },
  required: ["type"],
};

const paymentsPaths = {
  "/api/stores/{storeId}/payments/methods": {
    get: {
      tags: ["Métodos de Pago"],
      summary: "Listar métodos de pago",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { methods: { type: "array", items: { $ref: "#/components/schemas/PaymentMethod" } } } }),
        "401": r401,
        "403": r403,
      },
    },
    post: {
      tags: ["Métodos de Pago"],
      summary: "Crear método de pago",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam],
      requestBody: { required: true, content: { "application/json": { schema: paymentMethodInput } } },
      responses: {
        "201": jsendSuccess({ type: "object", properties: { method: { $ref: "#/components/schemas/PaymentMethod" } } }, "Método creado."),
        "401": r401,
        "403": r403,
        "422": r422,
      },
    },
  },
  "/api/stores/{storeId}/payments/methods/{id}": {
    patch: {
      tags: ["Métodos de Pago"],
      summary: "Actualizar método de pago",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      requestBody: { required: true, content: { "application/json": { schema: { ...paymentMethodInput, required: [] } } } },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { method: { $ref: "#/components/schemas/PaymentMethod" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
        "422": r422,
      },
    },
    delete: {
      tags: ["Métodos de Pago"],
      summary: "Eliminar método de pago",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { deleted: { type: "boolean" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
};

// ─── Shipping ──────────────────────────────────────────────────────────────────

const shippingMethodInput = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["store_pickup", "generic_delivery"] },
    name: { type: "string", minLength: 1, maxLength: 120 },
    cost: { type: "integer", minimum: 0 },
    maxDistanceKm: { type: "integer", minimum: 0 },
    estimatedDays: { type: "integer", minimum: 0 },
    isActive: { type: "boolean", default: true },
  },
  required: ["type", "name", "cost"],
};

const shippingPaths = {
  "/api/stores/{storeId}/shipping/methods": {
    get: {
      tags: ["Métodos de Envío"],
      summary: "Listar métodos de envío",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { methods: { type: "array", items: { $ref: "#/components/schemas/ShippingMethod" } } } }),
        "401": r401,
        "403": r403,
      },
    },
    post: {
      tags: ["Métodos de Envío"],
      summary: "Crear método de envío",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam],
      requestBody: { required: true, content: { "application/json": { schema: shippingMethodInput } } },
      responses: {
        "201": jsendSuccess({ type: "object", properties: { method: { $ref: "#/components/schemas/ShippingMethod" } } }, "Método creado."),
        "401": r401,
        "403": r403,
        "422": r422,
      },
    },
  },
  "/api/stores/{storeId}/shipping/methods/{id}": {
    patch: {
      tags: ["Métodos de Envío"],
      summary: "Actualizar método de envío",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      requestBody: { required: true, content: { "application/json": { schema: { ...shippingMethodInput, required: [] } } } },
      responses: {
        "200": jsendSuccess({ type: "object", properties: { method: { $ref: "#/components/schemas/ShippingMethod" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
        "422": r422,
      },
    },
    delete: {
      tags: ["Métodos de Envío"],
      summary: "Eliminar método de envío",
      security: [{ userAuth: [] }],
      parameters: [storeIdParam, { $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": jsendSuccess({ type: "object", properties: { deleted: { type: "boolean" } } }),
        "401": r401,
        "403": r403,
        "404": r404,
      },
    },
  },
};

// ─── Stats ────────────────────────────────────────────────────────────────────

const statsPaths = {
  "/api/stores/{storeId}/stats/summary": {
    get: {
      tags: ["Estadísticas"],
      summary: "Resumen de ventas",
      security: [{ userAuth: [] }],
      parameters: [
        storeIdParam,
        { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
        { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
      ],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            totalOrders: { type: "integer" },
            totalRevenue: { type: "integer" },
            totalCustomers: { type: "integer" },
            averageOrderValue: { type: "number" },
          },
        }),
        "401": r401,
        "403": r403,
      },
    },
  },
  "/api/stores/{storeId}/stats/top-products": {
    get: {
      tags: ["Estadísticas"],
      summary: "Productos más vendidos",
      security: [{ userAuth: [] }],
      parameters: [
        storeIdParam,
        { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
        { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
        { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 10 } },
      ],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string" },
                  productName: { type: "string" },
                  totalSold: { type: "integer" },
                  totalRevenue: { type: "integer" },
                },
              },
            },
          },
        }),
        "401": r401,
        "403": r403,
      },
    },
  },
  "/api/stores/{storeId}/stats/orders-by-status": {
    get: {
      tags: ["Estadísticas"],
      summary: "Órdenes agrupadas por estado",
      security: [{ userAuth: [] }],
      parameters: [
        storeIdParam,
        { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
        { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
      ],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            byStatus: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  status: { type: "string" },
                  count: { type: "integer" },
                },
              },
            },
          },
        }),
        "401": r401,
        "403": r403,
      },
    },
  },
  "/api/stores/{storeId}/stats/revenue-over-time": {
    get: {
      tags: ["Estadísticas"],
      summary: "Ingresos a lo largo del tiempo",
      security: [{ userAuth: [] }],
      parameters: [
        storeIdParam,
        { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
        { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
        { name: "interval", in: "query", schema: { type: "string", enum: ["day", "week", "month"], default: "day" } },
      ],
      responses: {
        "200": jsendSuccess({
          type: "object",
          properties: {
            series: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string", format: "date" },
                  revenue: { type: "integer" },
                  orders: { type: "integer" },
                },
              },
            },
          },
        }),
        "401": r401,
        "403": r403,
      },
    },
  },
};

// ─── Export all paths ─────────────────────────────────────────────────────────

export const paths = {
  ...healthPaths,
  ...authPaths,
  ...authCustomerPaths,
  ...usersPaths,
  ...adminPaths,
  ...storesPaths,
  ...productsPaths,
  ...categoriesPaths,
  ...couponsPaths,
  ...cartPaths,
  ...cartsAdminPaths,
  ...ordersPaths,
  ...storeCustomersPaths,
  ...customerProfilePaths,
  ...paymentsPaths,
  ...shippingPaths,
  ...statsPaths,
};
