import { createRootRoute, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { useState, useEffect, createContext, useContext } from "react";
import { getUser, onAuthChange, logout, handleAuthCallback } from "@netlify/identity";
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { drizzle } from "drizzle-orm/netlify-db";
import { pgTable, timestamp, text, serial, numeric, date, integer } from "drizzle-orm/pg-core";
import { eq, and, gte, lte, desc } from "drizzle-orm";
const IdentityContext = createContext(null);
function IdentityProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    getUser().then((u) => {
      setUser(u ?? null);
      setReady(true);
    });
    const unsubscribe = onAuthChange((_, u) => {
      setUser(u ?? null);
    });
    return unsubscribe;
  }, []);
  return /* @__PURE__ */ jsx(IdentityContext.Provider, { value: { user, ready, logout }, children });
}
function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used within an IdentityProvider");
  return ctx;
}
const AUTH_HASH_PATTERN = /^#(confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/;
function CallbackHandler({ children }) {
  useEffect(() => {
    if (AUTH_HASH_PATTERN.test(window.location.hash)) {
      handleAuthCallback();
    }
  }, []);
  return /* @__PURE__ */ jsx(Fragment, { children });
}
const Route$6 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Fuellio – Fuel Tracker" }
    ]
  }),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(IdentityProvider, { children: /* @__PURE__ */ jsx(CallbackHandler, { children }) }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$1 = () => import("./login-oPhnyzZQ.js");
const Route$5 = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-CvMrZ1o5.js");
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);
const Route$4 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const vehicles = pgTable("vehicles", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull(),
  name: text().notNull(),
  vehicleType: text("vehicle_type").notNull(),
  // 'car' | 'bike'
  fuelType: text("fuel_type").notNull(),
  // 'petrol' | 'diesel' | 'cng' | 'electric'
  createdAt: timestamp("created_at").defaultNow()
});
const fillups = pgTable("fillups", {
  id: serial().primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  fillupDate: date("fillup_date").notNull(),
  fillupTime: text("fillup_time").notNull(),
  fuelPrice: numeric("fuel_price", { precision: 10, scale: 2 }).notNull(),
  amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull(),
  fuelQuantity: numeric("fuel_quantity", { precision: 10, scale: 3 }).notNull(),
  odometerReading: numeric("odometer_reading", { precision: 10, scale: 1 }).notNull(),
  notes: text(),
  createdAt: timestamp("created_at").defaultNow()
});
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  fillups,
  vehicles
}, Symbol.toStringTag, { value: "Module" }));
const db = drizzle({ schema });
const Route$3 = createFileRoute("/api/vehicles")({
  server: {
    handlers: {
      GET: async () => {
        const user = await getUser();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const rows = await db.select().from(vehicles).where(eq(vehicles.userId, user.id));
        return Response.json(rows);
      },
      POST: async ({ request }) => {
        const user = await getUser();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const body = await request.json();
        const { name, vehicleType, fuelType } = body;
        if (!name || !vehicleType || !fuelType) {
          return Response.json({ error: "Missing fields" }, { status: 400 });
        }
        const [row] = await db.insert(vehicles).values({
          userId: user.id,
          name,
          vehicleType,
          fuelType
        }).returning();
        return Response.json(row, { status: 201 });
      }
    }
  }
});
const Route$2 = createFileRoute("/api/fillups")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getUser();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const url = new URL(request.url);
        const vehicleId = url.searchParams.get("vehicleId");
        const dateFrom = url.searchParams.get("dateFrom");
        const dateTo = url.searchParams.get("dateTo");
        const conditions = [eq(fillups.userId, user.id)];
        if (vehicleId) conditions.push(eq(fillups.vehicleId, parseInt(vehicleId)));
        if (dateFrom) conditions.push(gte(fillups.fillupDate, dateFrom));
        if (dateTo) conditions.push(lte(fillups.fillupDate, dateTo));
        const rows = await db.select({
          id: fillups.id,
          vehicleId: fillups.vehicleId,
          userId: fillups.userId,
          fillupDate: fillups.fillupDate,
          fillupTime: fillups.fillupTime,
          fuelPrice: fillups.fuelPrice,
          amountPaid: fillups.amountPaid,
          fuelQuantity: fillups.fuelQuantity,
          odometerReading: fillups.odometerReading,
          notes: fillups.notes,
          createdAt: fillups.createdAt,
          vehicleName: vehicles.name,
          vehicleType: vehicles.vehicleType,
          fuelType: vehicles.fuelType
        }).from(fillups).innerJoin(vehicles, eq(fillups.vehicleId, vehicles.id)).where(and(...conditions)).orderBy(desc(fillups.fillupDate), desc(fillups.fillupTime));
        const enriched = await Promise.all(
          rows.map(async (row) => {
            const [prev] = await db.select({ odometerReading: fillups.odometerReading }).from(fillups).where(
              and(
                eq(fillups.vehicleId, row.vehicleId),
                eq(fillups.userId, user.id),
                lte(fillups.fillupDate, row.fillupDate)
              )
            ).orderBy(desc(fillups.fillupDate), desc(fillups.fillupTime)).limit(2).then((r) => r.filter((x) => x.odometerReading !== row.odometerReading)[0] ? [r.filter((x) => x.odometerReading !== row.odometerReading)[0]] : [null]).then((r) => r);
            const distance = prev ? parseFloat(row.odometerReading) - parseFloat(prev.odometerReading) : null;
            const qty = parseFloat(row.fuelQuantity);
            const mileage = distance && qty > 0 ? distance / qty : null;
            return { ...row, distance, mileage };
          })
        );
        return Response.json(enriched);
      },
      POST: async ({ request }) => {
        const user = await getUser();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const body = await request.json();
        const { vehicleId, fillupDate, fillupTime, fuelPrice, amountPaid, fuelQuantity, odometerReading, notes } = body;
        if (!vehicleId || !fillupDate || !fillupTime || !fuelPrice || !amountPaid || !fuelQuantity || !odometerReading) {
          return Response.json({ error: "Missing required fields" }, { status: 400 });
        }
        const [vehicle] = await db.select().from(vehicles).where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, user.id)));
        if (!vehicle) return Response.json({ error: "Vehicle not found" }, { status: 404 });
        const [row] = await db.insert(fillups).values({
          vehicleId,
          userId: user.id,
          fillupDate,
          fillupTime,
          fuelPrice: String(fuelPrice),
          amountPaid: String(amountPaid),
          fuelQuantity: String(fuelQuantity),
          odometerReading: String(odometerReading),
          notes: notes || null
        }).returning();
        return Response.json(row, { status: 201 });
      }
    }
  }
});
const Route$1 = createFileRoute("/api/vehicles/$id")({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        const user = await getUser();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const id = parseInt(params.id);
        const body = await request.json();
        const { name, vehicleType, fuelType } = body;
        const [row] = await db.update(vehicles).set({ name, vehicleType, fuelType }).where(and(eq(vehicles.id, id), eq(vehicles.userId, user.id))).returning();
        if (!row) return Response.json({ error: "Not found" }, { status: 404 });
        return Response.json(row);
      },
      DELETE: async ({ params }) => {
        const user = await getUser();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const id = parseInt(params.id);
        await db.delete(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.userId, user.id)));
        return new Response(null, { status: 204 });
      }
    }
  }
});
const Route = createFileRoute("/api/fillups/$id")({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        const user = await getUser();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const id = parseInt(params.id);
        const body = await request.json();
        const { vehicleId, fillupDate, fillupTime, fuelPrice, amountPaid, fuelQuantity, odometerReading, notes } = body;
        if (vehicleId) {
          const [vehicle] = await db.select().from(vehicles).where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, user.id)));
          if (!vehicle) return Response.json({ error: "Vehicle not found" }, { status: 404 });
        }
        const [row] = await db.update(fillups).set({
          vehicleId,
          fillupDate,
          fillupTime,
          fuelPrice: String(fuelPrice),
          amountPaid: String(amountPaid),
          fuelQuantity: String(fuelQuantity),
          odometerReading: String(odometerReading),
          notes: notes || null
        }).where(and(eq(fillups.id, id), eq(fillups.userId, user.id))).returning();
        if (!row) return Response.json({ error: "Not found" }, { status: 404 });
        return Response.json(row);
      },
      DELETE: async ({ params }) => {
        const user = await getUser();
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const id = parseInt(params.id);
        await db.delete(fillups).where(and(eq(fillups.id, id), eq(fillups.userId, user.id)));
        return new Response(null, { status: 204 });
      }
    }
  }
});
const LoginRoute = Route$5.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$6
});
const IndexRoute = Route$4.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$6
});
const ApiVehiclesRoute = Route$3.update({
  id: "/api/vehicles",
  path: "/api/vehicles",
  getParentRoute: () => Route$6
});
const ApiFillupsRoute = Route$2.update({
  id: "/api/fillups",
  path: "/api/fillups",
  getParentRoute: () => Route$6
});
const ApiVehiclesIdRoute = Route$1.update({
  id: "/$id",
  path: "/$id",
  getParentRoute: () => ApiVehiclesRoute
});
const ApiFillupsIdRoute = Route.update({
  id: "/$id",
  path: "/$id",
  getParentRoute: () => ApiFillupsRoute
});
const ApiFillupsRouteChildren = {
  ApiFillupsIdRoute
};
const ApiFillupsRouteWithChildren = ApiFillupsRoute._addFileChildren(
  ApiFillupsRouteChildren
);
const ApiVehiclesRouteChildren = {
  ApiVehiclesIdRoute
};
const ApiVehiclesRouteWithChildren = ApiVehiclesRoute._addFileChildren(
  ApiVehiclesRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  LoginRoute,
  ApiFillupsRoute: ApiFillupsRouteWithChildren,
  ApiVehiclesRoute: ApiVehiclesRouteWithChildren
};
const routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  router as r,
  useIdentity as u
};
