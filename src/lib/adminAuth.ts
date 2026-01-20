import { NextRequest } from "next/server";

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

if (!ADMIN_SECRET_KEY) {
  // We don't throw here to avoid failing build if env is missing,
  // but admin routes will respond with 500/401 accordingly.
  console.warn("ADMIN_SECRET_KEY is not set in environment variables.");
}

export function assertAdminAuthorized(req: NextRequest) {
  const headerKey = req.headers.get("x-admin-key");

  if (!ADMIN_SECRET_KEY) {
    return {
      ok: false,
      status: 500,
      message: "Admin secret key is not configured on the server.",
    } as const;
  }

  if (!headerKey || headerKey !== ADMIN_SECRET_KEY) {
    return {
      ok: false,
      status: 401,
      message: "Unauthorized: invalid admin key.",
    } as const;
  }

  return { ok: true } as const;
}

