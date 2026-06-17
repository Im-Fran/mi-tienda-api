// OpenAPI 3.1 component definitions: schemas, parameters, responses, security schemes.

export const securitySchemes = {
  userAuth: {
    type: "http",
    scheme: "bearer",
    description:
      "Bearer token de sesión de usuario (propietario de tienda / admin). Obtener desde POST /api/auth/magic-link o GET /api/auth/oauth/{provider}.",
  },
  customerAuth: {
    type: "http",
    scheme: "bearer",
    description:
      "Bearer token de sesión de cliente (comprador). Obtener desde POST /api/auth/customer/magic-link o GET /api/auth/customer/oauth/{provider}.",
  },
};

// ─── Schemas ───────────────────────────────────────────────────────────────

export const schemas = {
  // Common utility ─────────────────────────────────────────────────────────

  JSendError: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["error"] },
      message: { type: "string" },
      data: { description: "Contexto adicional del error" },
    },
    required: ["status", "message"],
  },

  JSendFail: {
    type: "object",
    description: "Error del cliente (4xx). data contiene detalles del problema.",
    properties: {
      status: { type: "string", enum: ["fail"] },
      message: { type: "string" },
      data: {},
    },
    required: ["status"],
  },

  ValidationErrors: {
    type: "object",
    description: "Errores de validación campo por campo (422).",
    properties: {
      status: { type: "string", enum: ["fail"] },
      message: { type: "string" },
      data: {
        type: "object",
        additionalProperties: {
          type: "array",
          items: { type: "string" },
        },
        example: { email: ["Invalid email address"], name: ["Required"] },
      },
    },
    required: ["status", "data"],
  },

  Pagination: {
    type: "object",
    properties: {
      page: { type: "integer", minimum: 1 },
      perPage: { type: "integer", minimum: 1, maximum: 100 },
      total: { type: "integer", minimum: 0 },
      totalPages: { type: "integer", minimum: 0 },
    },
    required: ["page", "perPage", "total", "totalPages"],
  },

  // Auth & identity ─────────────────────────────────────────────────────────

  User: {
    type: "object",
    description: "Propietario de tienda o administrador de la plataforma.",
    properties: {
      id: { type: "string" },
      email: { type: "string", format: "email" },
      name: { type: ["string", "null"] },
      avatarUrl: { type: ["string", "null"], format: "uri" },
      provider: { type: "string", enum: ["google", "github", "email"] },
      emailVerified: {
        type: ["integer", "null"],
        description: "Unix timestamp (segundos)",
      },
      createdAt: { type: "integer", description: "Unix timestamp (segundos)" },
      updatedAt: { type: "integer", description: "Unix timestamp (segundos)" },
    },
    required: ["id", "email", "provider", "createdAt", "updatedAt"],
  },

  Customer: {
    type: "object",
    description: "Cliente comprador de una tienda.",
    properties: {
      id: { type: "string" },
      email: { type: "string", format: "email" },
      name: { type: ["string", "null"] },
      avatarUrl: { type: ["string", "null"], format: "uri" },
      provider: {
        type: "string",
        enum: ["google", "github", "email", "guest"],
      },
      phone: { type: ["string", "null"] },
      idDocument: { type: ["string", "null"] },
      emailVerified: { type: ["integer", "null"] },
      createdAt: { type: "integer" },
      updatedAt: { type: "integer" },
    },
    required: ["id", "email", "provider", "createdAt", "updatedAt"],
  },

  AuthToken: {
    type: "object",
    properties: {
      token: {
        type: "string",
        description: "Bearer token para usar en el header Authorization.",
      },
    },
    required: ["token"],
  },

  // Store ──────────────────────────────────────────────────────────────────

  Store: {
    type: "object",
    properties: {
      id: { type: "string" },
      userId: { type: "string" },
      name: { type: "string" },
      slug: { type: "string", description: "Identificador URL-safe único" },
      logoR2Key: { type: ["string", "null"] },
      isActive: { type: "boolean" },
      createdAt: { type: "integer" },
      updatedAt: { type: "integer" },
    },
    required: ["id", "userId", "name", "slug", "isActive", "createdAt", "updatedAt"],
  },

  BankTransferInfo: {
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

  StoreSettings: {
    type: "object",
    properties: {
      id: { type: "string" },
      storeId: { type: "string" },
      requireCustomerIdDocument: { type: "boolean" },
      taxLabel: { type: "string", maxLength: 40 },
      taxRate: { type: "number", minimum: 0, maximum: 100 },
      decimalSeparator: { type: "string", enum: [".", ","] },
      decimalPlaces: { type: "integer", minimum: 0, maximum: 6 },
      currencyCode: { type: "string", minLength: 3, maxLength: 3 },
      currencySymbol: { type: "string" },
      countryMode: {
        type: "string",
        enum: ["inclusive", "exclusive"],
        description: "inclusive = impuesto incluido en el precio; exclusive = se agrega al total",
      },
      bankTransferInfo: {
        oneOf: [{ $ref: "#/components/schemas/BankTransferInfo" }, { type: "null" }],
      },
      countries: {
        type: "array",
        items: { type: "string", minLength: 2, maxLength: 2 },
        description: "Códigos ISO 3166-1 alpha-2",
      },
      createdAt: { type: "integer" },
      updatedAt: { type: "integer" },
    },
    required: [
      "id",
      "storeId",
      "requireCustomerIdDocument",
      "taxLabel",
      "taxRate",
      "currencyCode",
      "countryMode",
      "createdAt",
      "updatedAt",
    ],
  },

  // Products ───────────────────────────────────────────────────────────────

  VariantOption: {
    type: "object",
    properties: {
      id: { type: "string" },
      variantId: { type: "string" },
      optionName: { type: "string", maxLength: 60 },
      optionValue: { type: "string", maxLength: 120 },
    },
    required: ["id", "variantId", "optionName", "optionValue"],
  },

  ProductVariant: {
    type: "object",
    properties: {
      id: { type: "string" },
      productId: { type: "string" },
      name: { type: "string", maxLength: 120 },
      sku: { type: ["string", "null"], maxLength: 80 },
      price: {
        type: "integer",
        minimum: 0,
        description: "Precio en unidades menores (ej: centavos)",
      },
      compareAtPrice: { type: ["integer", "null"], minimum: 0 },
      stock: { type: "integer", minimum: 0 },
      weight: {
        type: ["integer", "null"],
        minimum: 0,
        description: "Peso en gramos",
      },
      digitalFileR2Key: { type: ["string", "null"] },
      options: {
        type: "array",
        items: { $ref: "#/components/schemas/VariantOption" },
      },
      createdAt: { type: "integer" },
      updatedAt: { type: "integer" },
    },
    required: ["id", "productId", "name", "price", "stock", "options", "createdAt", "updatedAt"],
  },

  ProductImage: {
    type: "object",
    properties: {
      id: { type: "string" },
      productId: { type: "string" },
      r2Key: { type: "string" },
      sortOrder: { type: "integer" },
      isMain: { type: "boolean" },
    },
    required: ["id", "productId", "r2Key", "sortOrder", "isMain"],
  },

  Product: {
    type: "object",
    properties: {
      id: { type: "string" },
      storeId: { type: "string" },
      name: { type: "string", maxLength: 200 },
      shortDescription: { type: ["string", "null"], maxLength: 300 },
      fullDescription: { type: ["string", "null"], description: "Markdown" },
      type: { type: "string", enum: ["physical", "digital"] },
      mainImageR2Key: { type: ["string", "null"] },
      isActive: { type: "boolean" },
      variants: {
        type: "array",
        items: { $ref: "#/components/schemas/ProductVariant" },
      },
      images: {
        type: "array",
        items: { $ref: "#/components/schemas/ProductImage" },
      },
      createdAt: { type: "integer" },
      updatedAt: { type: "integer" },
    },
    required: ["id", "storeId", "name", "type", "isActive", "variants", "images", "createdAt", "updatedAt"],
  },

  // Categories ─────────────────────────────────────────────────────────────

  Category: {
    type: "object",
    properties: {
      id: { type: "string" },
      storeId: { type: "string" },
      name: { type: "string", maxLength: 120 },
      slug: { type: "string" },
      description: { type: ["string", "null"] },
      parentId: { type: ["string", "null"] },
      sortOrder: { type: "integer" },
      children: {
        type: "array",
        items: { $ref: "#/components/schemas/Category" },
        description: "Subcategorías anidadas",
      },
      createdAt: { type: "integer" },
      updatedAt: { type: "integer" },
    },
    required: ["id", "storeId", "name", "slug", "sortOrder", "children", "createdAt", "updatedAt"],
  },

  // Coupons ────────────────────────────────────────────────────────────────

  Coupon: {
    type: "object",
    properties: {
      id: { type: "string" },
      storeId: { type: "string" },
      code: { type: "string", maxLength: 40 },
      type: { type: "string", enum: ["percentage", "fixed"] },
      value: {
        type: "integer",
        minimum: 0,
        description: "Para percentage: 0-100. Para fixed: unidades menores.",
      },
      appliesTo: { type: "string", enum: ["all", "products", "categories"] },
      occasion: { type: ["string", "null"] },
      minOrderAmount: { type: ["integer", "null"], minimum: 0 },
      maxUses: { type: ["integer", "null"], minimum: 1 },
      usedCount: { type: "integer", minimum: 0 },
      startsAt: { type: ["string", "null"], format: "date-time" },
      expiresAt: { type: ["string", "null"], format: "date-time" },
      isActive: { type: "boolean" },
      productIds: { type: "array", items: { type: "string" } },
      categoryIds: { type: "array", items: { type: "string" } },
      createdAt: { type: "integer" },
      updatedAt: { type: "integer" },
    },
    required: [
      "id",
      "storeId",
      "code",
      "type",
      "value",
      "appliesTo",
      "usedCount",
      "isActive",
      "productIds",
      "categoryIds",
      "createdAt",
      "updatedAt",
    ],
  },

  // Cart ───────────────────────────────────────────────────────────────────

  CartItem: {
    type: "object",
    properties: {
      id: { type: "string" },
      cartId: { type: "string" },
      variantId: { type: "string" },
      quantity: { type: "integer", minimum: 1 },
      unitPrice: {
        type: "integer",
        minimum: 0,
        description: "Precio unitario snapshot en unidades menores",
      },
    },
    required: ["id", "cartId", "variantId", "quantity", "unitPrice"],
  },

  Cart: {
    type: "object",
    properties: {
      id: { type: "string" },
      storeId: { type: "string" },
      customerId: { type: ["string", "null"] },
      guestToken: {
        type: ["string", "null"],
        description: "Token para carritos de invitados",
      },
      status: { type: "string", enum: ["pending", "completed"] },
      couponId: { type: ["string", "null"] },
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/CartItem" },
      },
      createdAt: { type: "integer" },
      updatedAt: { type: "integer" },
    },
    required: ["id", "storeId", "status", "items", "createdAt", "updatedAt"],
  },

  // Orders ─────────────────────────────────────────────────────────────────

  ProductSnapshot: {
    type: "object",
    description: "Snapshot del producto/variante en el momento de la compra.",
    properties: {
      productId: { type: "string" },
      productName: { type: "string" },
      variantId: { type: "string" },
      variantName: { type: "string" },
      sku: { type: ["string", "null"] },
      type: { type: "string", enum: ["physical", "digital"] },
    },
    required: ["productId", "productName", "variantId", "variantName", "type"],
  },

  AddressSnapshot: {
    type: "object",
    description: "Snapshot de dirección en el momento de la orden.",
    properties: {
      label: { type: ["string", "null"] },
      addressLine1: { type: "string" },
      addressLine2: { type: ["string", "null"] },
      city: { type: "string" },
      state: { type: ["string", "null"] },
      countryCode: { type: "string" },
      postalCode: { type: ["string", "null"] },
    },
    required: ["addressLine1", "city", "countryCode"],
  },

  GuestSnapshot: {
    type: "object",
    description: "Datos del comprador invitado en el momento de la orden.",
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      phone: { type: ["string", "null"] },
      idDocument: { type: ["string", "null"] },
      documentType: { type: "string", enum: ["receipt", "invoice"] },
    },
    required: ["name", "email", "documentType"],
  },

  OrderItem: {
    type: "object",
    properties: {
      id: { type: "string" },
      orderId: { type: "string" },
      variantId: { type: ["string", "null"] },
      productSnapshot: { $ref: "#/components/schemas/ProductSnapshot" },
      quantity: { type: "integer", minimum: 1 },
      unitPrice: { type: "integer", minimum: 0 },
      totalPrice: { type: "integer", minimum: 0 },
    },
    required: ["id", "orderId", "productSnapshot", "quantity", "unitPrice", "totalPrice"],
  },

  Order: {
    type: "object",
    properties: {
      id: { type: "string" },
      storeId: { type: "string" },
      cartId: { type: ["string", "null"] },
      customerId: { type: ["string", "null"] },
      status: {
        type: "string",
        enum: [
          "pending_payment",
          "paid",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded",
        ],
      },
      documentType: { type: "string", enum: ["receipt", "invoice"] },
      subtotal: { type: "integer", description: "Unidades menores" },
      discountAmount: { type: "integer" },
      taxAmount: { type: "integer" },
      shippingAmount: { type: "integer" },
      total: { type: "integer" },
      currencyCode: { type: "string" },
      paymentMethodId: { type: ["string", "null"] },
      paymentReference: { type: ["string", "null"] },
      notes: { type: ["string", "null"] },
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/OrderItem" },
      },
      billingSnapshot: {
        oneOf: [{ $ref: "#/components/schemas/AddressSnapshot" }, { type: "null" }],
      },
      shippingSnapshot: {
        oneOf: [{ $ref: "#/components/schemas/AddressSnapshot" }, { type: "null" }],
      },
      guestSnapshot: {
        oneOf: [{ $ref: "#/components/schemas/GuestSnapshot" }, { type: "null" }],
      },
      createdAt: { type: "integer" },
      updatedAt: { type: "integer" },
    },
    required: [
      "id",
      "storeId",
      "status",
      "documentType",
      "subtotal",
      "discountAmount",
      "taxAmount",
      "shippingAmount",
      "total",
      "currencyCode",
      "items",
      "createdAt",
      "updatedAt",
    ],
  },

  // Payments & Shipping ────────────────────────────────────────────────────

  PaymentMethod: {
    type: "object",
    properties: {
      id: { type: "string" },
      storeId: { type: "string" },
      type: { type: "string", enum: ["in_person", "bank_transfer", "external"] },
      providerName: { type: ["string", "null"] },
      config: {
        type: ["object", "null"],
        additionalProperties: true,
        description: "Configuración libre según el tipo",
      },
      isActive: { type: "boolean" },
      createdAt: { type: "integer" },
      updatedAt: { type: "integer" },
    },
    required: ["id", "storeId", "type", "isActive", "createdAt", "updatedAt"],
  },

  ShippingMethod: {
    type: "object",
    properties: {
      id: { type: "string" },
      storeId: { type: "string" },
      type: { type: "string", enum: ["store_pickup", "generic_delivery"] },
      name: { type: "string", maxLength: 120 },
      cost: { type: "integer", minimum: 0, description: "Costo en unidades menores" },
      maxDistanceKm: { type: ["integer", "null"], minimum: 0 },
      estimatedDays: { type: ["integer", "null"], minimum: 0 },
      isActive: { type: "boolean" },
      createdAt: { type: "integer" },
      updatedAt: { type: "integer" },
    },
    required: ["id", "storeId", "type", "name", "cost", "isActive", "createdAt", "updatedAt"],
  },

  // Customers ──────────────────────────────────────────────────────────────

  CustomerAddress: {
    type: "object",
    properties: {
      id: { type: "string" },
      customerId: { type: "string" },
      label: { type: ["string", "null"], maxLength: 60 },
      addressLine1: { type: "string", maxLength: 200 },
      addressLine2: { type: ["string", "null"], maxLength: 200 },
      city: { type: "string", maxLength: 120 },
      state: { type: ["string", "null"], maxLength: 120 },
      countryCode: { type: "string", minLength: 2, maxLength: 2 },
      postalCode: { type: ["string", "null"], maxLength: 20 },
      isDefault: { type: "boolean" },
      createdAt: { type: "integer" },
      updatedAt: { type: "integer" },
    },
    required: [
      "id",
      "customerId",
      "addressLine1",
      "city",
      "countryCode",
      "isDefault",
      "createdAt",
      "updatedAt",
    ],
  },

  // Admin ──────────────────────────────────────────────────────────────────

  SystemRole: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      createdAt: { type: "integer" },
    },
    required: ["id", "name", "createdAt"],
  },

  SystemPermission: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: {
        type: "string",
        description: "Formato: entidad.acción (ej: store.delete, user.view)",
      },
      description: { type: ["string", "null"] },
      createdAt: { type: "integer" },
    },
    required: ["id", "name", "createdAt"],
  },
};

// ─── Reusable Parameters ───────────────────────────────────────────────────

export const parameters = {
  StoreId: {
    name: "storeId",
    in: "path",
    required: true,
    schema: { type: "string" },
    description: "ID de la tienda",
  },
  ResourceId: {
    name: "id",
    in: "path",
    required: true,
    schema: { type: "string" },
    description: "ID del recurso",
  },
  Page: {
    name: "page",
    in: "query",
    schema: { type: "integer", minimum: 1, default: 1 },
  },
  PerPage: {
    name: "perPage",
    in: "query",
    schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
  },
};

// ─── Reusable Responses ────────────────────────────────────────────────────

export const responses = {
  Unauthorized: {
    description: "No autenticado — token ausente, inválido o expirado.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/JSendFail" },
        example: { status: "fail", message: "Unauthorized" },
      },
    },
  },
  Forbidden: {
    description: "Sin permisos suficientes para este recurso.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/JSendFail" },
        example: { status: "fail", message: "Forbidden" },
      },
    },
  },
  NotFound: {
    description: "Recurso no encontrado.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/JSendFail" },
        example: { status: "fail", message: "Not found", data: null },
      },
    },
  },
  UnprocessableEntity: {
    description: "Error de validación del cuerpo de la petición.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ValidationErrors" },
      },
    },
  },
  InternalError: {
    description: "Error interno del servidor.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/JSendError" },
      },
    },
  },
};
