# Graph Report - mi-tienda-api (2026-06-18)

## Corpus Check

- 105 files · ~42,074 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1012 nodes · 2020 edges · 52 communities (47 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `50099452`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- [[_COMMUNITY_Error Handling & Validators|Error Handling & Validators]]
- [[_COMMUNITY_Core DB Schema|Core DB Schema]]
- [[_COMMUNITY_Crypto & Utility Layer|Crypto & Utility Layer]]
- [[_COMMUNITY_Auth Libraries & Email|Auth Libraries & Email]]
- [[_COMMUNITY_Migration Snapshot (Permissions)|Migration Snapshot (Permissions)]]
- [[_COMMUNITY_E-Commerce Schema (ProductsCoupons)|E-Commerce Schema (Products/Coupons)]]
- [[_COMMUNITY_Documentation & API Overview|Documentation & API Overview]]
- [[_COMMUNITY_OpenAPI Specification|OpenAPI Specification]]
- [[_COMMUNITY_User Roles DB Snapshot|User Roles DB Snapshot]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Stores DB Snapshot|Stores DB Snapshot]]
- [[_COMMUNITY_Customer & Shipping Services|Customer & Shipping Services]]
- [[_COMMUNITY_R2 File Storage|R2 File Storage]]
- [[_COMMUNITY_Product & File Services|Product & File Services]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Users DB Snapshot|Users DB Snapshot]]
- [[_COMMUNITY_DB Middleware & Connection|DB Middleware & Connection]]
- [[_COMMUNITY_System Roles DB Snapshot|System Roles DB Snapshot]]
- [[_COMMUNITY_Customer Addresses Snapshot|Customer Addresses Snapshot]]
- [[_COMMUNITY_Store Countries Snapshot|Store Countries Snapshot]]
- [[_COMMUNITY_System Permissions Snapshot|System Permissions Snapshot]]
- [[_COMMUNITY_Magic Links DB Snapshot|Magic Links DB Snapshot]]
- [[_COMMUNITY_Cart & Order Validators|Cart & Order Validators]]
- [[_COMMUNITY_Orders & Stats Services|Orders & Stats Services]]
- [[_COMMUNITY_Migration Snapshot Root|Migration Snapshot Root]]
- [[_COMMUNITY_Store Countries FK Snapshot|Store Countries FK Snapshot]]
- [[_COMMUNITY_Store Settings FK Snapshot|Store Settings FK Snapshot]]
- [[_COMMUNITY_Avatar URL Column Snapshot|Avatar URL Column Snapshot]]
- [[_COMMUNITY_Bank Transfer Column Snapshot|Bank Transfer Column Snapshot]]
- [[_COMMUNITY_Consumed Column Snapshot|Consumed Column Snapshot]]
- [[_COMMUNITY_Country Mode Column Snapshot|Country Mode Column Snapshot]]
- [[_COMMUNITY_Currency Code Column Snapshot|Currency Code Column Snapshot]]
- [[_COMMUNITY_Currency Symbol Column Snapshot|Currency Symbol Column Snapshot]]
- [[_COMMUNITY_Decimal Places Column Snapshot|Decimal Places Column Snapshot]]
- [[_COMMUNITY_Decimal Separator Column Snapshot|Decimal Separator Column Snapshot]]
- [[_COMMUNITY_Description Column Snapshot|Description Column Snapshot]]
- [[_COMMUNITY_Is Active Column Snapshot|Is Active Column Snapshot]]
- [[_COMMUNITY_Logo R2 Key Column Snapshot|Logo R2 Key Column Snapshot]]
- [[_COMMUNITY_Require Customer ID Column Snapshot|Require Customer ID Column Snapshot]]
- [[_COMMUNITY_Tax Label Column Snapshot|Tax Label Column Snapshot]]
- [[_COMMUNITY_Tax Rate Column Snapshot|Tax Rate Column Snapshot]]
- [[_COMMUNITY_Updated At Column Snapshot|Updated At Column Snapshot]]
- [[_COMMUNITY_ID Column Snapshot|ID Column Snapshot]]
- [[_COMMUNITY_Drizzle Migration Journal|Drizzle Migration Journal]]
- [[_COMMUNITY_Claude Settings Hooks|Claude Settings Hooks]]
- [[_COMMUNITY_Local Dev Permissions|Local Dev Permissions]]
- [[_COMMUNITY_Permission Seed Data|Permission Seed Data]]
- [[_COMMUNITY_Test Environment Config|Test Environment Config]]
- [[_COMMUNITY_Community 67|Community 67]]

## God Nodes (most connected - your core abstractions)

1. `notFound()` - 46 edges
2. `mi-tienda-api` - 30 edges
3. `AppEnv` - 23 edges
4. `Mi Tienda API` - 20 edges
5. `Database` - 18 edges
6. `success()` - 18 edges
7. `db()` - 18 edges
8. `Endpoints de la API` - 18 edges
9. `badRequest()` - 16 edges
10. `compilerOptions` - 15 edges

## Surprising Connections (you probably didn't know these)

- `db()` --calls--> `createDb()` [EXTRACTED]
  test/helpers.ts → src/db/index.ts
- `authUser()` --calls--> `createUserSession()` [EXTRACTED]
  test/helpers.ts → src/lib/session.ts
- `authCustomer()` --calls--> `createCustomerSession()` [EXTRACTED]
  test/helpers.ts → src/lib/session.ts
- `Graphify Workflow` --rationale_for--> `mi-tienda-api` [EXTRACTED]
  CLAUDE.md → README.md
- `removePermissionFromRole()` --calls--> `notFound()` [EXTRACTED]
  src/services/admin.ts → src/lib/errors.ts

## Import Cycles

- None detected.

## Hyperedges (group relationships)

- **Authentication Mechanisms** — readme_magic_link_auth, readme_oauth2, readme_opaque_sessions, readme_cloudflare_kv [EXTRACTED 1.00]
- **Atomic Checkout Flow** — readme_atomic_checkout, readme_cloudflare_d1, readme_guest_checkout, readme_money_minor_units [EXTRACTED 1.00]
- **Cloudflare Platform Stack** — readme_cloudflare_workers, readme_cloudflare_d1, readme_cloudflare_kv, readme_cloudflare_r2 [EXTRACTED 1.00]
- **Cloudflare Infrastructure Stack** — readme_cloudflare_workers, readme_cloudflare_d1, readme_cloudflare_kv, readme_cloudflare_r2 [EXTRACTED 0.95]
- **Authentication System** — readme_auth_magic_link, readme_auth_oauth, readme_resend, readme_cloudflare_kv [EXTRACTED 0.90]
- **API Layer Architecture** — readme_src_routes, readme_src_services, readme_src_middleware, readme_src_validators [INFERRED 0.85]

## Communities (52 total, 5 thin omitted)

### Community 0 - "Error Handling & Validators"

Cohesion: 0.06
Nodes (70): AppError, formatZodError(), unauthorized(), ValidationError, error(), JSend, JSendError, JSendFail (+62 more)

### Community 1 - "Core DB Schema"

Cohesion: 0.06
Nodes (58): MAGIC_LINK_SUBJECTS, CART_STATUSES, cartItems, categories, AddressSnapshot, BankTransferInfo, createdAt(), GuestSnapshot (+50 more)

### Community 2 - "Crypto & Utility Layer"

Cohesion: 0.08
Nodes (51): uuid(), badRequest(), conflict(), forbidden(), optionalCustomerMiddleware, cartRouter, carts, productCategories (+43 more)

### Community 3 - "Auth Libraries & Email"

Cohesion: 0.09
Nodes (42): base64UrlEncode(), randomToken(), sha256Hex(), magicLinkTemplate(), sendMagicLinkEmail(), sendViaResend(), fail(), consumeMagicLink() (+34 more)

### Community 4 - "Migration Snapshot (Permissions)"

Cohesion: 0.04
Nodes (46): permission_id, role_id, user_id, role_permissions_role_id_permission_id_pk, role_permissions_permission_id_system_permissions_id_fk, role_permissions_role_id_system_roles_id_fk, autoincrement, name (+38 more)

### Community 5 - "E-Commerce Schema (Products/Coupons)"

Cohesion: 0.27
Nodes (12): slugify(), assertParentInStore(), buildTree(), CategoryNode, CategoryRow, createCategory(), deleteCategory(), ensureCategory() (+4 more)

### Community 6 - "Documentation & API Overview"

Cohesion: 0.05
Nodes (62): Graphify Workflow, 1. Aplicar migraciones en la base de datos local, 1. Autenticarse en Cloudflare, 2. Aplicar migraciones en producción, 2. Iniciar el servidor de desarrollo, 3. Configurar secretos de producción, 4. Desplegar, Atomic Checkout Transaction (+54 more)

### Community 7 - "OpenAPI Specification"

Cohesion: 0.06
Nodes (35): parameters, responses, schemas, securitySchemes, openApiRouter, spec, adminPaths, authCustomerPaths (+27 more)

### Community 8 - "User Roles DB Snapshot"

Cohesion: 0.08
Nodes (26): user_system_roles_user_id_role_id_pk, user_system_roles_role_id_system_roles_id_fk, user_system_roles_user_id_users_id_fk, user_system_roles, checkConstraints, compositePrimaryKeys, foreignKeys, indexes (+18 more)

### Community 9 - "Package Dependencies"

Cohesion: 0.08
Nodes (24): dependencies, drizzle-orm, hono, @hono/swagger-ui, zod, devDependencies, @cloudflare/vitest-pool-workers, @cloudflare/workers-types (+16 more)

### Community 10 - "Stores DB Snapshot"

Cohesion: 0.09
Nodes (23): stores_user_id_users_id_fk, stores_slug_unique, stores_user_idx, checkConstraints, compositePrimaryKeys, foreignKeys, indexes, name (+15 more)

### Community 11 - "Customer & Shipping Services"

Cohesion: 0.21
Nodes (10): notFound(), addAddress(), deleteAddress(), getCustomer(), getStoreCustomer(), unsetDefaultAddresses(), updateAddress(), updateCustomer() (+2 more)

### Community 12 - "R2 File Storage"

Cohesion: 0.14
Nodes (18): buildR2Key(), R2Body, uploadFile(), productImages, storeCountries, storeSettings, addProductImages(), collectStoreR2Keys() (+10 more)

### Community 13 - "Product & File Services"

Cohesion: 0.20
Nodes (17): deleteFile(), addVariant(), collectProductR2Keys(), createProduct(), deleteProduct(), deleteVariant(), ensureProduct(), getProduct() (+9 more)

### Community 14 - "TypeScript Config"

Cohesion: 0.11
Nodes (18): compilerOptions, esModuleInterop, jsx, jsxImportSource, lib, module, moduleResolution, noEmit (+10 more)

### Community 15 - "Users DB Snapshot"

Cohesion: 0.04
Nodes (48): name, dialect, store_settings_store_id_stores_id_fk, id, system_permissions_name_unique, users_email_unique, users_provider_idx, prevId (+40 more)

### Community 16 - "DB Middleware & Connection"

Cohesion: 0.19
Nodes (9): createDb(), Database, dbMiddleware, orders, getCustomerOrder(), getOrder(), OrderFilters, updateOrderStatus() (+1 more)

### Community 17 - "System Roles DB Snapshot"

Cohesion: 0.17
Nodes (12): system_roles_name_unique, checkConstraints, columns, compositePrimaryKeys, foreignKeys, indexes, name, columns (+4 more)

### Community 18 - "Customer Addresses Snapshot"

Cohesion: 0.18
Nodes (11): customer_id, label, columns, autoincrement, name, notNull, primaryKey, type (+3 more)

### Community 19 - "Store Countries Snapshot"

Cohesion: 0.06
Nodes (32): country_code, store_id, autoincrement, name, notNull, primaryKey, type, store_countries_store_id_stores_id_fk (+24 more)

### Community 20 - "System Permissions Snapshot"

Cohesion: 0.11
Nodes (32): coupons, rolePermissions, SYSTEM_ROLE_NAMES, systemPermissions, systemRoles, USER_PROVIDERS, users, userSystemRoles (+24 more)

### Community 21 - "Magic Links DB Snapshot"

Cohesion: 0.04
Nodes (47): consumed, email, expires_at, subject_type, token_hash, autoincrement, default, name (+39 more)

### Community 22 - "Cart & Order Validators"

Cohesion: 0.15
Nodes (13): autoincrement, name, notNull, primaryKey, type, avatar_url, provider, autoincrement (+5 more)

### Community 23 - "Orders & Stats Services"

Cohesion: 0.33
Nodes (8): orderItems, dateConds(), ordersByStatus(), PAID_SQL, REVENUE_SQL, revenueOverTime(), summary(), topProducts()

### Community 24 - "Migration Snapshot Root"

Cohesion: 0.29
Nodes (7): created_at, autoincrement, default, name, notNull, primaryKey, type

### Community 25 - "Store Countries FK Snapshot"

Cohesion: 0.29
Nodes (7): email_verified, autoincrement, default, name, notNull, primaryKey, type

### Community 26 - "Store Settings FK Snapshot"

Cohesion: 0.33
Nodes (6): provider_id, autoincrement, name, notNull, primaryKey, type

### Community 27 - "Avatar URL Column Snapshot"

Cohesion: 0.11
Nodes (18): Administración del sistema (`/api/admin`), Autenticación de clientes (`/api/auth/customer`), Autenticación de usuarios (`/api/auth`), Carrito (`/api/stores/:storeId/cart`), Carritos — vista admin (`/api/stores/:storeId/carts`), Categorías (`/api/stores/:storeId/categories`), Clientes de la tienda — vista admin (`/api/stores/:storeId/customers`), Cupones (`/api/stores/:storeId/coupons`) (+10 more)

### Community 28 - "Bank Transfer Column Snapshot"

Cohesion: 0.29
Nodes (7): autoincrement, name, notNull, primaryKey, type, bank_transfer_info, columns

### Community 29 - "Consumed Column Snapshot"

Cohesion: 0.33
Nodes (3): shippingMethods, deleteShippingMethod(), updateShippingMethod()

### Community 31 - "Country Mode Column Snapshot"

Cohesion: 0.29
Nodes (7): country_mode, autoincrement, default, name, notNull, primaryKey, type

### Community 33 - "Currency Code Column Snapshot"

Cohesion: 0.29
Nodes (7): currency_code, autoincrement, default, name, notNull, primaryKey, type

### Community 34 - "Currency Symbol Column Snapshot"

Cohesion: 0.29
Nodes (7): currency_symbol, autoincrement, default, name, notNull, primaryKey, type

### Community 35 - "Decimal Places Column Snapshot"

Cohesion: 0.29
Nodes (7): decimal_places, autoincrement, default, name, notNull, primaryKey, type

### Community 36 - "Decimal Separator Column Snapshot"

Cohesion: 0.29
Nodes (7): decimal_separator, autoincrement, default, name, notNull, primaryKey, type

### Community 37 - "Description Column Snapshot"

Cohesion: 0.15
Nodes (13): description, name, autoincrement, name, notNull, primaryKey, type, autoincrement (+5 more)

### Community 39 - "Is Active Column Snapshot"

Cohesion: 0.29
Nodes (7): is_active, autoincrement, default, name, notNull, primaryKey, type

### Community 40 - "Logo R2 Key Column Snapshot"

Cohesion: 0.15
Nodes (13): logo_r2_key, slug, autoincrement, name, notNull, primaryKey, type, autoincrement (+5 more)

### Community 41 - "Require Customer ID Column Snapshot"

Cohesion: 0.29
Nodes (7): require_customer_id_document, autoincrement, default, name, notNull, primaryKey, type

### Community 42 - "Tax Label Column Snapshot"

Cohesion: 0.29
Nodes (7): tax_label, autoincrement, default, name, notNull, primaryKey, type

### Community 43 - "Tax Rate Column Snapshot"

Cohesion: 0.29
Nodes (7): tax_rate, autoincrement, default, name, notNull, primaryKey, type

### Community 45 - "Updated At Column Snapshot"

Cohesion: 0.29
Nodes (7): updated_at, autoincrement, default, name, notNull, primaryKey, type

### Community 49 - "ID Column Snapshot"

Cohesion: 0.33
Nodes (6): id, autoincrement, name, notNull, primaryKey, type

### Community 57 - "Drizzle Migration Journal"

Cohesion: 0.50
Nodes (3): dialect, entries, version

## Knowledge Gaps

- **476 isolated node(s):** `PreToolUse`, `allow`, `version`, `dialect`, `id` (+471 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `tables` connect `Users DB Snapshot` to `Migration Snapshot (Permissions)`, `User Roles DB Snapshot`, `Stores DB Snapshot`, `System Roles DB Snapshot`, `Store Countries Snapshot`, `Magic Links DB Snapshot`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `columns` connect `Bank Transfer Column Snapshot` to `Currency Code Column Snapshot`, `Currency Symbol Column Snapshot`, `Decimal Places Column Snapshot`, `Decimal Separator Column Snapshot`, `Require Customer ID Column Snapshot`, `Tax Label Column Snapshot`, `Tax Rate Column Snapshot`, `Updated At Column Snapshot`, `Users DB Snapshot`, `Store Countries Snapshot`, `Migration Snapshot Root`, `Country Mode Column Snapshot`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `columns` connect `Logo R2 Key Column Snapshot` to `Migration Snapshot (Permissions)`, `Description Column Snapshot`, `Is Active Column Snapshot`, `Stores DB Snapshot`, `Updated At Column Snapshot`, `ID Column Snapshot`, `Migration Snapshot Root`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `PreToolUse`, `allow`, `version` to the rest of the system?**
  _483 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Error Handling & Validators` be split into smaller, more focused modules?**
  _Cohesion score 0.06161314413741598 - nodes in this community are weakly interconnected._
- **Should `Core DB Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.05701592002961866 - nodes in this community are weakly interconnected._
- **Should `Crypto & Utility Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.07948568088836938 - nodes in this community are weakly interconnected._
