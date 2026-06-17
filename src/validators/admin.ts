import { z } from "zod";

export const assignRolesSchema = z
  .object({
    add: z.array(z.string().min(1)).default([]),
    remove: z.array(z.string().min(1)).default([]),
  })
  .refine((v) => v.add.length > 0 || v.remove.length > 0, {
    message: "Provide at least one role to add or remove",
  });

export const assignPermissionSchema = z.object({
  permissionId: z.string().min(1),
});
