# Graph Report - mi-tienda-api  (2026-06-17)

## Corpus Check
- 98 files · ~29,700 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 916 nodes · 1865 edges · 69 communities (63 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `be8ea10d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Auth & Email Services|Auth & Email Services]]
- [[_COMMUNITY_Database Schema Core|Database Schema Core]]
- [[_COMMUNITY_Migration Snapshot|Migration Snapshot]]
- [[_COMMUNITY_Auth Columns Snapshot|Auth Columns Snapshot]]
- [[_COMMUNITY_Roles & Permissions Snapshot|Roles & Permissions Snapshot]]
- [[_COMMUNITY_Cart & Customer Middleware|Cart & Customer Middleware]]
- [[_COMMUNITY_Crypto & Session Core|Crypto & Session Core]]
- [[_COMMUNITY_Store Countries Snapshot|Store Countries Snapshot]]
- [[_COMMUNITY_Cloudflare Stack Docs|Cloudflare Stack Docs]]
- [[_COMMUNITY_R2 File Storage|R2 File Storage]]
- [[_COMMUNITY_User Roles Snapshot|User Roles Snapshot]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Stores Schema Snapshot|Stores Schema Snapshot]]
- [[_COMMUNITY_OAuth & Shipping|OAuth & Shipping]]
- [[_COMMUNITY_Users & Permissions|Users & Permissions]]
- [[_COMMUNITY_Orders & Customers|Orders & Customers]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Category Management|Category Management]]
- [[_COMMUNITY_Store & Product Assets|Store & Product Assets]]
- [[_COMMUNITY_Avatar URL Column|Avatar URL Column]]
- [[_COMMUNITY_Description Column|Description Column]]
- [[_COMMUNITY_Logo & Slug Column|Logo & Slug Column]]
- [[_COMMUNITY_Coupons & Categories|Coupons & Categories]]
- [[_COMMUNITY_System Roles Snapshot|System Roles Snapshot]]
- [[_COMMUNITY_Customer Addresses Snapshot|Customer Addresses Snapshot]]
- [[_COMMUNITY_Order Stats|Order Stats]]
- [[_COMMUNITY_Product Types & Validators|Product Types & Validators]]
- [[_COMMUNITY_Bank Transfer Column|Bank Transfer Column]]
- [[_COMMUNITY_Country Mode Column|Country Mode Column]]
- [[_COMMUNITY_Timestamps Column|Timestamps Column]]
- [[_COMMUNITY_Currency Code Column|Currency Code Column]]
- [[_COMMUNITY_Currency Symbol Column|Currency Symbol Column]]
- [[_COMMUNITY_Decimal Places Column|Decimal Places Column]]
- [[_COMMUNITY_Decimal Separator Column|Decimal Separator Column]]
- [[_COMMUNITY_Email Verified Column|Email Verified Column]]
- [[_COMMUNITY_Is Active Column|Is Active Column]]
- [[_COMMUNITY_ID Document Column|ID Document Column]]
- [[_COMMUNITY_Tax Label Column|Tax Label Column]]
- [[_COMMUNITY_Tax Rate Column|Tax Rate Column]]
- [[_COMMUNITY_Updated At Column|Updated At Column]]
- [[_COMMUNITY_Error Handling|Error Handling]]
- [[_COMMUNITY_ID Column Snapshot|ID Column Snapshot]]
- [[_COMMUNITY_Provider ID Column|Provider ID Column]]
- [[_COMMUNITY_Migration Journal|Migration Journal]]
- [[_COMMUNITY_Claude Code Config|Claude Code Config]]
- [[_COMMUNITY_Permission Seed Data|Permission Seed Data]]
- [[_COMMUNITY_Test Environment|Test Environment]]
- [[_COMMUNITY_API Routes Docs|API Routes Docs]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]

## God Nodes (most connected - your core abstractions)
1. `notFound()` - 46 edges
2. `AppEnv` - 23 edges
3. `miTienda API` - 20 edges
4. `Database` - 18 edges
5. `success()` - 18 edges
6. `badRequest()` - 16 edges
7. `compilerOptions` - 15 edges
8. `stores` - 14 edges
9. `randomToken()` - 14 edges
10. `parseJson()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `authUser()` --calls--> `createUserSession()`  [EXTRACTED]
  test/helpers.ts → src/lib/session.ts
- `authCustomer()` --calls--> `createCustomerSession()`  [EXTRACTED]
  test/helpers.ts → src/lib/session.ts
- `db()` --calls--> `createDb()`  [EXTRACTED]
  test/helpers.ts → src/db/index.ts
- `removePermissionFromRole()` --calls--> `notFound()`  [EXTRACTED]
  src/services/admin.ts → src/lib/errors.ts
- `deleteCoupon()` --calls--> `notFound()`  [EXTRACTED]
  src/services/coupons.ts → src/lib/errors.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Authentication Mechanisms** — readme_magic_link_auth, readme_oauth2, readme_opaque_sessions, readme_cloudflare_kv [EXTRACTED 1.00]
- **Atomic Checkout Flow** — readme_atomic_checkout, readme_cloudflare_d1, readme_guest_checkout, readme_money_minor_units [EXTRACTED 1.00]
- **Cloudflare Platform Stack** — readme_cloudflare_workers, readme_cloudflare_d1, readme_cloudflare_kv, readme_cloudflare_r2 [EXTRACTED 1.00]

## Communities (69 total, 6 thin omitted)

### Community 0 - "Auth & Email Services"
Cohesion: 0.07
Nodes (54): Database, base64UrlEncode(), randomToken(), sha256Hex(), magicLinkTemplate(), sendMagicLinkEmail(), sendViaResend(), fail() (+46 more)

### Community 1 - "Database Schema Core"
Cohesion: 0.06
Nodes (57): MAGIC_LINK_SUBJECTS, cartItems, carts, categories, AddressSnapshot, BankTransferInfo, createdAt(), GuestSnapshot (+49 more)

### Community 2 - "Migration Snapshot"
Cohesion: 0.13
Nodes (15): users_email_unique, users_provider_idx, users, checkConstraints, compositePrimaryKeys, columns, isUnique, name (+7 more)

### Community 3 - "Auth Columns Snapshot"
Cohesion: 0.13
Nodes (15): magic_links_email_idx, magic_links_token_hash_idx, checkConstraints, compositePrimaryKeys, columns, isUnique, name, foreignKeys (+7 more)

### Community 4 - "Roles & Permissions Snapshot"
Cohesion: 0.04
Nodes (46): permission_id, role_id, user_id, role_permissions_role_id_permission_id_pk, role_permissions_permission_id_system_permissions_id_fk, role_permissions_role_id_system_roles_id_fk, autoincrement, name (+38 more)

### Community 5 - "Cart & Customer Middleware"
Cohesion: 0.09
Nodes (50): slugify(), uuid(), badRequest(), conflict(), forbidden(), optionalCustomerMiddleware, cartRouter, DOCUMENT_TYPES (+42 more)

### Community 6 - "Crypto & Session Core"
Cohesion: 0.12
Nodes (27): createDb(), productCategories, couponCategories, couponProducts, coupons, productVariants, CouponEvaluation, CouponLineItem (+19 more)

### Community 7 - "Store Countries Snapshot"
Cohesion: 0.06
Nodes (32): country_code, store_id, autoincrement, name, notNull, primaryKey, type, store_countries_store_id_stores_id_fk (+24 more)

### Community 8 - "Cloudflare Stack Docs"
Cohesion: 0.09
Nodes (30): Atomic Checkout Transaction, Cloudflare D1, Cloudflare KV, Cloudflare R2, Cloudflare Workers, drizzle/migrations/, Drizzle ORM, drizzle/seed.sql (+22 more)

### Community 9 - "R2 File Storage"
Cohesion: 0.07
Nodes (43): notFound(), buildR2Key(), deleteFile(), R2Body, uploadFile(), productImages, shippingMethods, storeCountries (+35 more)

### Community 10 - "User Roles Snapshot"
Cohesion: 0.08
Nodes (26): user_system_roles_user_id_role_id_pk, user_system_roles_role_id_system_roles_id_fk, user_system_roles_user_id_users_id_fk, user_system_roles, checkConstraints, compositePrimaryKeys, foreignKeys, indexes (+18 more)

### Community 11 - "Package Dependencies"
Cohesion: 0.08
Nodes (23): dependencies, drizzle-orm, hono, zod, devDependencies, @cloudflare/vitest-pool-workers, @cloudflare/workers-types, drizzle-kit (+15 more)

### Community 12 - "Stores Schema Snapshot"
Cohesion: 0.22
Nodes (9): stores_slug_unique, stores_user_idx, indexes, columns, isUnique, name, columns, isUnique (+1 more)

### Community 13 - "OAuth & Shipping"
Cohesion: 0.15
Nodes (14): error(), JSend, JSendError, JSendFail, JSendSuccess, dbMiddleware, adminRouter, authRouter (+6 more)

### Community 14 - "Users & Permissions"
Cohesion: 0.20
Nodes (13): parseParams(), parseQuery(), cartsAdminRouter, statusSchema, storeCustomersRouter, CART_STATUSES, createCategorySchema, deleteCategoryQuerySchema (+5 more)

### Community 15 - "Orders & Customers"
Cohesion: 0.26
Nodes (7): bearerToken(), authMiddleware, shippingRouter, SHIPPING_METHOD_TYPES, createShippingMethodSchema, updateShippingMethodSchema, updateUserSchema

### Community 16 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, esModuleInterop, jsx, jsxImportSource, lib, module, moduleResolution, noEmit (+10 more)

### Community 17 - "Category Management"
Cohesion: 0.24
Nodes (9): ADMIN_ROLES, publicStoreContextMiddleware, storeContextMiddleware, couponsRouter, COUPON_APPLIES_TO, COUPON_TYPES, createCouponSchema, updateCouponSchema (+1 more)

### Community 18 - "Store & Product Assets"
Cohesion: 0.18
Nodes (11): system_permissions_name_unique, checkConstraints, compositePrimaryKeys, foreignKeys, indexes, name, columns, isUnique (+3 more)

### Community 19 - "Avatar URL Column"
Cohesion: 0.29
Nodes (7): autoincrement, name, notNull, primaryKey, type, avatar_url, columns

### Community 20 - "Description Column"
Cohesion: 0.29
Nodes (7): description, autoincrement, name, notNull, primaryKey, type, columns

### Community 21 - "Logo & Slug Column"
Cohesion: 0.29
Nodes (7): logo_r2_key, autoincrement, name, notNull, primaryKey, type, columns

### Community 22 - "Coupons & Categories"
Cohesion: 0.31
Nodes (7): categoriesRouter, COUNTRY_MODES, DECIMAL_SEPARATORS, bankTransferInfoSchema, createStoreSchema, updateStoreSchema, updateStoreSettingsSchema

### Community 23 - "System Roles Snapshot"
Cohesion: 0.18
Nodes (11): system_roles_name_unique, checkConstraints, compositePrimaryKeys, foreignKeys, indexes, name, columns, isUnique (+3 more)

### Community 24 - "Customer Addresses Snapshot"
Cohesion: 0.18
Nodes (11): customer_id, label, columns, autoincrement, name, notNull, primaryKey, type (+3 more)

### Community 25 - "Order Stats"
Cohesion: 0.16
Nodes (13): orderItems, orders, getCustomerOrder(), getOrder(), OrderFilters, updateOrderStatus(), dateConds(), ordersByStatus() (+5 more)

### Community 26 - "Product Types & Validators"
Cohesion: 0.19
Nodes (12): asUploadedFile(), collectUploads(), UploadedFile, productsRouter, PRODUCT_TYPES, createProductSchema, createVariantSchema, productFiltersSchema (+4 more)

### Community 27 - "Bank Transfer Column"
Cohesion: 0.29
Nodes (7): autoincrement, name, notNull, primaryKey, type, bank_transfer_info, columns

### Community 28 - "Country Mode Column"
Cohesion: 0.29
Nodes (7): country_mode, autoincrement, default, name, notNull, primaryKey, type

### Community 29 - "Timestamps Column"
Cohesion: 0.29
Nodes (7): created_at, autoincrement, default, name, notNull, primaryKey, type

### Community 30 - "Currency Code Column"
Cohesion: 0.29
Nodes (7): currency_code, autoincrement, default, name, notNull, primaryKey, type

### Community 31 - "Currency Symbol Column"
Cohesion: 0.29
Nodes (7): currency_symbol, autoincrement, default, name, notNull, primaryKey, type

### Community 32 - "Decimal Places Column"
Cohesion: 0.29
Nodes (7): decimal_places, autoincrement, default, name, notNull, primaryKey, type

### Community 33 - "Decimal Separator Column"
Cohesion: 0.29
Nodes (7): decimal_separator, autoincrement, default, name, notNull, primaryKey, type

### Community 34 - "Email Verified Column"
Cohesion: 0.29
Nodes (7): email_verified, autoincrement, default, name, notNull, primaryKey, type

### Community 35 - "Is Active Column"
Cohesion: 0.29
Nodes (7): is_active, autoincrement, default, name, notNull, primaryKey, type

### Community 36 - "ID Document Column"
Cohesion: 0.29
Nodes (7): require_customer_id_document, autoincrement, default, name, notNull, primaryKey, type

### Community 37 - "Tax Label Column"
Cohesion: 0.29
Nodes (7): tax_label, autoincrement, default, name, notNull, primaryKey, type

### Community 38 - "Tax Rate Column"
Cohesion: 0.29
Nodes (7): tax_rate, autoincrement, default, name, notNull, primaryKey, type

### Community 39 - "Updated At Column"
Cohesion: 0.29
Nodes (7): updated_at, autoincrement, default, name, notNull, primaryKey, type

### Community 40 - "Error Handling"
Cohesion: 0.16
Nodes (10): AppError, formatZodError(), unauthorized(), ValidationError, customerAuthMiddleware, permissionMiddleware(), customersRouter, addressInputSchema (+2 more)

### Community 41 - "ID Column Snapshot"
Cohesion: 0.33
Nodes (6): id, autoincrement, name, notNull, primaryKey, type

### Community 42 - "Provider ID Column"
Cohesion: 0.33
Nodes (6): provider_id, autoincrement, name, notNull, primaryKey, type

### Community 43 - "Migration Journal"
Cohesion: 0.50
Nodes (3): dialect, entries, version

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (7): name, dialect, id, prevId, tables, customer_addresses, version

### Community 52 - "Community 52"
Cohesion: 0.25
Nodes (8): store_settings_store_id_stores_id_fk, columnsFrom, columnsTo, name, onDelete, onUpdate, tableFrom, tableTo

### Community 53 - "Community 53"
Cohesion: 0.25
Nodes (8): stores_user_id_users_id_fk, columnsFrom, columnsTo, name, onDelete, onUpdate, tableFrom, tableTo

### Community 54 - "Community 54"
Cohesion: 0.29
Nodes (7): consumed, autoincrement, default, name, notNull, primaryKey, type

### Community 55 - "Community 55"
Cohesion: 0.29
Nodes (7): name, autoincrement, name, notNull, primaryKey, type, columns

### Community 56 - "Community 56"
Cohesion: 0.29
Nodes (7): token_hash, columns, autoincrement, name, notNull, primaryKey, type

### Community 57 - "Community 57"
Cohesion: 0.29
Nodes (7): checkConstraints, compositePrimaryKeys, foreignKeys, indexes, name, uniqueConstraints, store_settings

### Community 58 - "Community 58"
Cohesion: 0.33
Nodes (6): email, autoincrement, name, notNull, primaryKey, type

### Community 59 - "Community 59"
Cohesion: 0.33
Nodes (6): expires_at, autoincrement, name, notNull, primaryKey, type

### Community 60 - "Community 60"
Cohesion: 0.33
Nodes (6): provider, autoincrement, name, notNull, primaryKey, type

### Community 61 - "Community 61"
Cohesion: 0.33
Nodes (6): slug, autoincrement, name, notNull, primaryKey, type

### Community 62 - "Community 62"
Cohesion: 0.33
Nodes (6): subject_type, autoincrement, name, notNull, primaryKey, type

### Community 63 - "Community 63"
Cohesion: 0.33
Nodes (6): checkConstraints, compositePrimaryKeys, foreignKeys, name, uniqueConstraints, stores

### Community 64 - "Community 64"
Cohesion: 0.47
Nodes (4): ordersRouter, ORDER_STATUSES, orderFiltersSchema, updateOrderStatusSchema

### Community 65 - "Community 65"
Cohesion: 0.47
Nodes (4): paymentsRouter, PAYMENT_METHOD_TYPES, createPaymentMethodSchema, updatePaymentMethodSchema

### Community 66 - "Community 66"
Cohesion: 0.53
Nodes (4): statsRouter, revenueOverTimeSchema, statsRangeSchema, topProductsSchema

## Knowledge Gaps
- **413 isolated node(s):** `PreToolUse`, `graphify`, `allow`, `version`, `dialect` (+408 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `tables` connect `Community 51` to `Migration Snapshot`, `Auth Columns Snapshot`, `Roles & Permissions Snapshot`, `Store Countries Snapshot`, `User Roles Snapshot`, `Store & Product Assets`, `System Roles Snapshot`, `Community 57`, `Community 63`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `columns` connect `Bank Transfer Column` to `Decimal Places Column`, `Decimal Separator Column`, `ID Document Column`, `Tax Label Column`, `Tax Rate Column`, `Store Countries Snapshot`, `Updated At Column`, `Community 57`, `Country Mode Column`, `Timestamps Column`, `Currency Code Column`, `Currency Symbol Column`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `columns` connect `Logo & Slug Column` to `Is Active Column`, `Roles & Permissions Snapshot`, `Updated At Column`, `ID Column Snapshot`, `Timestamps Column`, `Community 55`, `Community 61`, `Community 63`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `PreToolUse`, `graphify`, `allow` to the rest of the system?**
  _419 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth & Email Services` be split into smaller, more focused modules?**
  _Cohesion score 0.06956521739130435 - nodes in this community are weakly interconnected._
- **Should `Database Schema Core` be split into smaller, more focused modules?**
  _Cohesion score 0.0625694187338023 - nodes in this community are weakly interconnected._
- **Should `Migration Snapshot` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._