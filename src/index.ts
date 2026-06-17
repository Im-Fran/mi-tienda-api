import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { AppError } from "./lib/errors";
import { error, fail, success } from "./lib/jsend";
import { dbMiddleware } from "./middleware/db";
import { openApiRouter } from "./openapi";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { customersRouter } from "./routes/customers";
import { storesRouter } from "./routes/stores";
import { usersRouter } from "./routes/users";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

// Request-scoped Drizzle client for every route.
app.use("*", dbMiddleware);

// Health check.
app.get("/", (c) => c.json(success({ name: "mi-tienda-api", status: "ok" })));
app.get("/api/health", (c) =>
  c.json(success({ status: "ok", time: new Date().toISOString() })),
);

// OpenAPI spec + Swagger UI.
app.route("/api", openApiRouter);

// Feature routers (all under /api).
app.route("/api/auth", authRouter);
app.route("/api/admin", adminRouter);
app.route("/api/users", usersRouter);
app.route("/api/stores", storesRouter);
app.route("/api/customers", customersRouter);

// 404 in JSend.
app.notFound((c) => c.json(fail({ path: c.req.path }, "Resource not found"), 404));

// Centralized error handling in JSend.
app.onError((err, c) => {
  if (err instanceof AppError) {
    const status = err.status as ContentfulStatusCode;
    if (err.status >= 500) return c.json(error(err.message, err.data), status);
    return c.json(fail(err.data ?? null, err.message), status);
  }
  console.error("Unhandled error:", err);
  return c.json(error("Internal Server Error"), 500);
});

export default app;
