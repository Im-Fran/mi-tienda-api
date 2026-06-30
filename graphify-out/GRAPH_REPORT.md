# Graph Report - mi-tienda-api  (2026-06-30)

## Corpus Check
- 105 files · ~42,218 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 981 nodes · 1952 edges · 71 communities (66 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fade642d`
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
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Country Mode Column Snapshot|Country Mode Column Snapshot]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Currency Code Column Snapshot|Currency Code Column Snapshot]]
- [[_COMMUNITY_Currency Symbol Column Snapshot|Currency Symbol Column Snapshot]]
- [[_COMMUNITY_Decimal Places Column Snapshot|Decimal Places Column Snapshot]]
- [[_COMMUNITY_Decimal Separator Column Snapshot|Decimal Separator Column Snapshot]]
- [[_COMMUNITY_Description Column Snapshot|Description Column Snapshot]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Is Active Column Snapshot|Is Active Column Snapshot]]
- [[_COMMUNITY_Logo R2 Key Column Snapshot|Logo R2 Key Column Snapshot]]
- [[_COMMUNITY_Require Customer ID Column Snapshot|Require Customer ID Column Snapshot]]
- [[_COMMUNITY_Tax Label Column Snapshot|Tax Label Column Snapshot]]
- [[_COMMUNITY_Tax Rate Column Snapshot|Tax Rate Column Snapshot]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Updated At Column Snapshot|Updated At Column Snapshot]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_ID Column Snapshot|ID Column Snapshot]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Drizzle Migration Journal|Drizzle Migration Journal]]
- [[_COMMUNITY_Claude Settings Hooks|Claude Settings Hooks]]
- [[_COMMUNITY_Local Dev Permissions|Local Dev Permissions]]
- [[_COMMUNITY_Permission Seed Data|Permission Seed Data]]
- [[_COMMUNITY_Test Environment Config|Test Environment Config]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]

## God Nodes (most connected - your core abstractions)
1. `notFound()` - 46 edges
2. `AppEnv` - 23 edges
3. `Endpoints de la API` - 18 edges
4. `Database` - 18 edges
5. `success()` - 18 edges
6. `db()` - 18 edges
7. `badRequest()` - 16 edges
8. `mi-tienda-api` - 15 edges
9. `compilerOptions` - 15 edges
10. `stores` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Graphify Workflow` --rationale_for--> `mi-tienda-api`  [EXTRACTED]
  CLAUDE.md → README.md
- `db()` --calls--> `createDb()`  [EXTRACTED]
  test/helpers.ts → src/db/index.ts
- `authUser()` --calls--> `createUserSession()`  [EXTRACTED]
  test/helpers.ts → src/lib/session.ts
- `authCustomer()` --calls--> `createCustomerSession()`  [EXTRACTED]
  test/helpers.ts → src/lib/session.ts
- `deleteCoupon()` --calls--> `notFound()`  [EXTRACTED]
  src/services/coupons.ts → src/lib/errors.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Authentication Mechanisms** — readme_magic_link_auth, readme_oauth2, readme_opaque_sessions, readme_cloudflare_kv [EXTRACTED 1.00]
- **Atomic Checkout Flow** — readme_atomic_checkout, readme_cloudflare_d1, readme_guest_checkout, readme_money_minor_units [EXTRACTED 1.00]
- **Cloudflare Platform Stack** — readme_cloudflare_workers, readme_cloudflare_d1, readme_cloudflare_kv, readme_cloudflare_r2 [EXTRACTED 1.00]
- **Cloudflare Infrastructure Stack** — readme_cloudflare_workers, readme_cloudflare_d1, readme_cloudflare_kv, readme_cloudflare_r2 [EXTRACTED 0.95]
- **Authentication System** — readme_auth_magic_link, readme_auth_oauth, readme_resend, readme_cloudflare_kv [EXTRACTED 0.90]
- **API Layer Architecture** — readme_src_routes, readme_src_services, readme_src_middleware, readme_src_validators [INFERRED 0.85]

## Communities (71 total, 5 thin omitted)

### Community 0 - "Error Handling & Validators"
Cohesion: 0.05
Nodes (80): unauthorized(), error(), JSend, JSendError, JSendFail, JSendSuccess, success(), asUploadedFile() (+72 more)

### Community 1 - "Core DB Schema"
Cohesion: 0.06
Nodes (62): MAGIC_LINK_SUBJECTS, CART_STATUSES, cartItems, carts, categories, AddressSnapshot, BankTransferInfo, createdAt() (+54 more)

### Community 2 - "Crypto & Utility Layer"
Cohesion: 0.25
Nodes (19): addItem(), applyCoupon(), assertAccess(), buildCartView(), CART_WITH, CartActor, cartLineItems(), cartSubtotal() (+11 more)

### Community 3 - "Auth Libraries & Email"
Cohesion: 0.08
Nodes (45): base64UrlEncode(), randomToken(), sha256Hex(), magicLinkTemplate(), sendMagicLinkEmail(), sendViaResend(), fail(), consumeMagicLink() (+37 more)

### Community 4 - "Migration Snapshot (Permissions)"
Cohesion: 0.20
Nodes (10): role_permissions_role_id_permission_id_pk, checkConstraints, compositePrimaryKeys, foreignKeys, indexes, name, columns, name (+2 more)

### Community 5 - "E-Commerce Schema (Products/Coupons)"
Cohesion: 0.27
Nodes (12): slugify(), assertParentInStore(), buildTree(), CategoryNode, CategoryRow, createCategory(), deleteCategory(), ensureCategory() (+4 more)

### Community 6 - "Documentation & API Overview"
Cohesion: 0.05
Nodes (41): Graphify Workflow, 1. Aplicar migraciones en la base de datos local, 1. Autenticarse en Cloudflare, 2. Aplicar migraciones en producción, 2. Iniciar el servidor de desarrollo, 3. Configurar secretos de producción, 4. Desplegar, Administración del sistema (`/api/admin`) (+33 more)

### Community 7 - "OpenAPI Specification"
Cohesion: 0.06
Nodes (35): parameters, responses, schemas, securitySchemes, openApiRouter, spec, adminPaths, authCustomerPaths (+27 more)

### Community 8 - "User Roles DB Snapshot"
Cohesion: 0.04
Nodes (46): permission_id, role_id, user_id, user_system_roles_user_id_role_id_pk, user_system_roles_role_id_system_roles_id_fk, user_system_roles_user_id_users_id_fk, autoincrement, name (+38 more)

### Community 9 - "Package Dependencies"
Cohesion: 0.06
Nodes (32): allowScripts, esbuild@0.18.20, esbuild@0.25.12, esbuild@0.27.3, esbuild@0.28.1, fsevents@2.3.3, sharp@0.34.5, workerd@1.20260625.1 (+24 more)

### Community 10 - "Stores DB Snapshot"
Cohesion: 0.22
Nodes (9): stores_slug_unique, stores_user_idx, indexes, columns, isUnique, name, columns, isUnique (+1 more)

### Community 11 - "Customer & Shipping Services"
Cohesion: 0.13
Nodes (18): notFound(), orders, assignPermissionToRole(), assignUserRoles(), getUserDetail(), listRoles(), removePermissionFromRole(), addAddress() (+10 more)

### Community 12 - "R2 File Storage"
Cohesion: 0.09
Nodes (36): buildR2Key(), deleteFile(), R2Body, uploadFile(), productImages, productVariantOptions, storeCountries, storeSettings (+28 more)

### Community 13 - "Product & File Services"
Cohesion: 0.22
Nodes (13): uuid(), AppError, badRequest(), conflict(), forbidden(), formatZodError(), ValidationError, LoadedCart (+5 more)

### Community 14 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, esModuleInterop, jsx, jsxImportSource, lib, module, moduleResolution, noEmit (+10 more)

### Community 15 - "Users DB Snapshot"
Cohesion: 0.22
Nodes (9): users_email_unique, users_provider_idx, columns, isUnique, name, indexes, columns, isUnique (+1 more)

### Community 16 - "DB Middleware & Connection"
Cohesion: 0.14
Nodes (9): createDb(), Database, dbMiddleware, shippingMethods, deletePaymentMethod(), updatePaymentMethod(), deleteShippingMethod(), updateShippingMethod() (+1 more)

### Community 17 - "System Roles DB Snapshot"
Cohesion: 0.29
Nodes (7): checkConstraints, columns, compositePrimaryKeys, foreignKeys, name, uniqueConstraints, system_roles

### Community 18 - "Customer Addresses Snapshot"
Cohesion: 0.33
Nodes (6): customer_id, autoincrement, name, notNull, primaryKey, type

### Community 19 - "Store Countries Snapshot"
Cohesion: 0.06
Nodes (32): country_code, store_id, autoincrement, name, notNull, primaryKey, type, store_countries_store_id_stores_id_fk (+24 more)

### Community 20 - "System Permissions Snapshot"
Cohesion: 0.21
Nodes (17): productVariants, users, guestCartWith(), freshStore(), api(), ApiOptions, authCustomer(), authUser() (+9 more)

### Community 21 - "Magic Links DB Snapshot"
Cohesion: 0.13
Nodes (15): magic_links_email_idx, magic_links_token_hash_idx, checkConstraints, compositePrimaryKeys, columns, isUnique, name, foreignKeys (+7 more)

### Community 22 - "Cart & Order Validators"
Cohesion: 0.29
Nodes (7): autoincrement, name, notNull, primaryKey, type, avatar_url, columns

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
Cohesion: 0.21
Nodes (11): productCategories, couponCategories, couponProducts, CouponEvaluation, CouponLineItem, CouponRow, createCoupon(), deleteCoupon() (+3 more)

### Community 28 - "Bank Transfer Column Snapshot"
Cohesion: 0.29
Nodes (7): autoincrement, name, notNull, primaryKey, type, bank_transfer_info, columns

### Community 29 - "Consumed Column Snapshot"
Cohesion: 0.25
Nodes (7): name, dialect, id, prevId, tables, customer_addresses, version

### Community 30 - "Community 30"
Cohesion: 0.25
Nodes (8): role_permissions_permission_id_system_permissions_id_fk, columnsFrom, columnsTo, name, onDelete, onUpdate, tableFrom, tableTo

### Community 31 - "Country Mode Column Snapshot"
Cohesion: 0.29
Nodes (7): country_mode, autoincrement, default, name, notNull, primaryKey, type

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (8): role_permissions_role_id_system_roles_id_fk, columnsFrom, columnsTo, name, onDelete, onUpdate, tableFrom, tableTo

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
Cohesion: 0.29
Nodes (7): description, autoincrement, name, notNull, primaryKey, type, columns

### Community 38 - "Community 38"
Cohesion: 0.25
Nodes (8): store_settings_store_id_stores_id_fk, columnsFrom, columnsTo, name, onDelete, onUpdate, tableFrom, tableTo

### Community 39 - "Is Active Column Snapshot"
Cohesion: 0.29
Nodes (7): is_active, autoincrement, default, name, notNull, primaryKey, type

### Community 40 - "Logo R2 Key Column Snapshot"
Cohesion: 0.29
Nodes (7): logo_r2_key, autoincrement, name, notNull, primaryKey, type, columns

### Community 41 - "Require Customer ID Column Snapshot"
Cohesion: 0.29
Nodes (7): require_customer_id_document, autoincrement, default, name, notNull, primaryKey, type

### Community 42 - "Tax Label Column Snapshot"
Cohesion: 0.29
Nodes (7): tax_label, autoincrement, default, name, notNull, primaryKey, type

### Community 43 - "Tax Rate Column Snapshot"
Cohesion: 0.29
Nodes (7): tax_rate, autoincrement, default, name, notNull, primaryKey, type

### Community 44 - "Community 44"
Cohesion: 0.25
Nodes (8): stores_user_id_users_id_fk, columnsFrom, columnsTo, name, onDelete, onUpdate, tableFrom, tableTo

### Community 45 - "Updated At Column Snapshot"
Cohesion: 0.29
Nodes (7): updated_at, autoincrement, default, name, notNull, primaryKey, type

### Community 46 - "Community 46"
Cohesion: 0.29
Nodes (7): consumed, autoincrement, default, name, notNull, primaryKey, type

### Community 47 - "Community 47"
Cohesion: 0.29
Nodes (7): token_hash, columns, autoincrement, name, notNull, primaryKey, type

### Community 48 - "Community 48"
Cohesion: 0.29
Nodes (7): checkConstraints, compositePrimaryKeys, foreignKeys, indexes, name, uniqueConstraints, store_settings

### Community 49 - "ID Column Snapshot"
Cohesion: 0.33
Nodes (6): id, autoincrement, name, notNull, primaryKey, type

### Community 50 - "Community 50"
Cohesion: 0.33
Nodes (6): email, autoincrement, name, notNull, primaryKey, type

### Community 51 - "Community 51"
Cohesion: 0.33
Nodes (6): expires_at, autoincrement, name, notNull, primaryKey, type

### Community 52 - "Community 52"
Cohesion: 0.33
Nodes (6): name, autoincrement, name, notNull, primaryKey, type

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (6): provider, autoincrement, name, notNull, primaryKey, type

### Community 54 - "Community 54"
Cohesion: 0.33
Nodes (6): slug, autoincrement, name, notNull, primaryKey, type

### Community 55 - "Community 55"
Cohesion: 0.33
Nodes (6): subject_type, autoincrement, name, notNull, primaryKey, type

### Community 56 - "Community 56"
Cohesion: 0.33
Nodes (6): checkConstraints, compositePrimaryKeys, foreignKeys, name, uniqueConstraints, stores

### Community 57 - "Drizzle Migration Journal"
Cohesion: 0.50
Nodes (3): dialect, entries, version

### Community 65 - "Community 65"
Cohesion: 0.33
Nodes (6): checkConstraints, compositePrimaryKeys, foreignKeys, name, uniqueConstraints, system_permissions

### Community 66 - "Community 66"
Cohesion: 0.33
Nodes (6): users, checkConstraints, compositePrimaryKeys, foreignKeys, name, uniqueConstraints

### Community 68 - "Community 68"
Cohesion: 0.40
Nodes (5): label, columns, name, primaryKey, type

### Community 69 - "Community 69"
Cohesion: 0.40
Nodes (5): system_permissions_name_unique, indexes, columns, isUnique, name

### Community 70 - "Community 70"
Cohesion: 0.40
Nodes (5): system_roles_name_unique, indexes, columns, isUnique, name

## Knowledge Gaps
- **481 isolated node(s):** `Tabla de contenidos`, `Tecnologías`, `Requisitos previos`, `Instalación`, `Variables de entorno` (+476 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `tables` connect `Consumed Column Snapshot` to `Community 65`, `Community 66`, `Migration Snapshot (Permissions)`, `User Roles DB Snapshot`, `Community 48`, `System Roles DB Snapshot`, `Store Countries Snapshot`, `Magic Links DB Snapshot`, `Community 56`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `columns` connect `Bank Transfer Column Snapshot` to `Currency Code Column Snapshot`, `Currency Symbol Column Snapshot`, `Decimal Places Column Snapshot`, `Decimal Separator Column Snapshot`, `Require Customer ID Column Snapshot`, `Tax Label Column Snapshot`, `Tax Rate Column Snapshot`, `Updated At Column Snapshot`, `Community 48`, `Store Countries Snapshot`, `Migration Snapshot Root`, `Country Mode Column Snapshot`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `columns` connect `Logo R2 Key Column Snapshot` to `Is Active Column Snapshot`, `User Roles DB Snapshot`, `Updated At Column Snapshot`, `ID Column Snapshot`, `Community 52`, `Community 54`, `Migration Snapshot Root`, `Community 56`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `Tabla de contenidos`, `Tecnologías`, `Requisitos previos` to the rest of the system?**
  _482 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Error Handling & Validators` be split into smaller, more focused modules?**
  _Cohesion score 0.05186880244088482 - nodes in this community are weakly interconnected._
- **Should `Core DB Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.056943056943056944 - nodes in this community are weakly interconnected._
- **Should `Auth Libraries & Email` be split into smaller, more focused modules?**
  _Cohesion score 0.08458646616541353 - nodes in this community are weakly interconnected._