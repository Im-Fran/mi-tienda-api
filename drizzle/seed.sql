-- Idempotent seed: system roles, permissions and default grants.
-- Apply with: wrangler d1 execute mi-tienda-db --remote --file=drizzle/seed.sql
-- (or through the Cloudflare API). Safe to run multiple times.

INSERT OR IGNORE INTO system_roles (id, name) VALUES
  ('role_administrator', 'Administrator'),
  ('role_user_admin', 'UserAdministrator'),
  ('role_store_admin', 'StoreAdministrator');

INSERT OR IGNORE INTO system_permissions (id, name, description) VALUES
  ('perm_user_view', 'user.view', 'View platform users'),
  ('perm_user_update', 'user.update', 'Update platform users'),
  ('perm_user_delete', 'user.delete', 'Delete platform users'),
  ('perm_user_manage_roles', 'user.manage_roles', 'Assign or remove user roles'),
  ('perm_store_view', 'store.view', 'View any store'),
  ('perm_store_update', 'store.update', 'Update any store'),
  ('perm_store_delete', 'store.delete', 'Delete any store'),
  ('perm_product_manage', 'product.manage', 'Manage products of any store'),
  ('perm_category_manage', 'category.manage', 'Manage categories of any store'),
  ('perm_coupon_manage', 'coupon.manage', 'Manage coupons of any store'),
  ('perm_order_view', 'order.view', 'View orders of any store'),
  ('perm_order_update', 'order.update', 'Update orders of any store'),
  ('perm_payment_manage', 'payment.manage', 'Manage payment methods'),
  ('perm_shipping_manage', 'shipping.manage', 'Manage shipping methods'),
  ('perm_customer_view', 'customer.view', 'View store customers'),
  ('perm_role_view', 'role.view', 'View roles and their permissions'),
  ('perm_role_manage_permissions', 'role.manage_permissions', 'Grant or revoke role permissions'),
  ('perm_permission_view', 'permission.view', 'View available permissions'),
  ('perm_stats_view', 'stats.view', 'View store statistics');

-- Administrator gets every permission.
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
  SELECT 'role_administrator', id FROM system_permissions;

-- UserAdministrator
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
  ('role_user_admin', 'perm_user_view'),
  ('role_user_admin', 'perm_user_update'),
  ('role_user_admin', 'perm_user_delete'),
  ('role_user_admin', 'perm_user_manage_roles'),
  ('role_user_admin', 'perm_role_view'),
  ('role_user_admin', 'perm_permission_view');

-- StoreAdministrator
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
  ('role_store_admin', 'perm_store_view'),
  ('role_store_admin', 'perm_store_update'),
  ('role_store_admin', 'perm_store_delete'),
  ('role_store_admin', 'perm_product_manage'),
  ('role_store_admin', 'perm_category_manage'),
  ('role_store_admin', 'perm_coupon_manage'),
  ('role_store_admin', 'perm_order_view'),
  ('role_store_admin', 'perm_order_update'),
  ('role_store_admin', 'perm_payment_manage'),
  ('role_store_admin', 'perm_shipping_manage'),
  ('role_store_admin', 'perm_customer_view'),
  ('role_store_admin', 'perm_stats_view');
