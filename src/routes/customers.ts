import { Hono } from "hono";
import { success } from "../lib/jsend";
import { parseJson, parseParams, parseQuery } from "../lib/validation";
import { customerAuthMiddleware } from "../middleware/customer-auth";
import * as customersSvc from "../services/customers";
import * as ordersSvc from "../services/orders";
import type { AppEnv } from "../types";
import {
  addressInputSchema,
  updateAddressSchema,
  updateCustomerSchema,
} from "../validators/customers";
import { idParamSchema, paginationQuerySchema } from "../validators/common";

export const customersRouter = new Hono<AppEnv>();
customersRouter.use(customerAuthMiddleware);

function customerId(c: { var: { customer?: { id: string } } }): string {
  // customerAuthMiddleware guarantees a customer is present.
  return c.var.customer!.id;
}

customersRouter.get("/me", (c) =>
  c.json(success({ customer: c.var.customer })),
);

customersRouter.patch("/me", async (c) => {
  const input = await parseJson(c, updateCustomerSchema);
  const customer = await customersSvc.updateCustomer(
    c.var.db,
    customerId(c),
    input,
  );
  return c.json(success({ customer }));
});

customersRouter.get("/me/addresses", async (c) =>
  c.json(success(await customersSvc.listAddresses(c.var.db, customerId(c)))),
);

customersRouter.post("/me/addresses", async (c) => {
  const input = await parseJson(c, addressInputSchema);
  const address = await customersSvc.addAddress(c.var.db, customerId(c), input);
  return c.json(success({ address }), 201);
});

customersRouter.patch("/me/addresses/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  const input = await parseJson(c, updateAddressSchema);
  const address = await customersSvc.updateAddress(
    c.var.db,
    customerId(c),
    id,
    input,
  );
  return c.json(success({ address }));
});

customersRouter.delete("/me/addresses/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  await customersSvc.deleteAddress(c.var.db, customerId(c), id);
  return c.json(success({ deleted: true }));
});

customersRouter.get("/me/orders", async (c) => {
  const { page, perPage } = parseQuery(c, paginationQuerySchema);
  return c.json(
    success(
      await ordersSvc.listCustomerOrders(c.var.db, customerId(c), page, perPage),
    ),
  );
});

customersRouter.get("/me/orders/:id", async (c) => {
  const { id } = parseParams(c, idParamSchema);
  return c.json(
    success(await ordersSvc.getCustomerOrder(c.var.db, customerId(c), id)),
  );
});
