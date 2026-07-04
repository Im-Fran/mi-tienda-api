import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateRoleSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
  })
  .refine((d) => d.name !== undefined || d.description !== undefined, {
    message: "Provide at least one field to update",
  });

export const assignUserRoleSchema = z.object({
  roleId: z.string().min(1),
  expiresAt: z.coerce.date().optional(),
});

export const assignUserPermissionSchema = z.object({
  permission: z
    .string()
    .min(1)
    .regex(/^[\w.*{}]+(?:\.[\w.*{}]+)*$/, "Invalid permission pattern"),
  priority: z.number().int().default(0),
  expiresAt: z.coerce.date().optional(),
});

export const assignRolePermissionSchema = z.object({
  permission: z
    .string()
    .min(1)
    .regex(/^[\w.*{}]+(?:\.[\w.*{}]+)*$|\*/, "Invalid permission pattern"),
  priority: z.number().int().default(0),
  expiresAt: z.coerce.date().optional(),
});
