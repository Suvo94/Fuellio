import { pgTable, serial, text, timestamp, integer, numeric, date } from "drizzle-orm/pg-core";

export const vehicles = pgTable("vehicles", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull(),
  name: text().notNull(),
  vehicleType: text("vehicle_type").notNull(), // 'car' | 'bike'
  fuelType: text("fuel_type").notNull(), // 'petrol' | 'diesel' | 'cng' | 'electric'
  createdAt: timestamp("created_at").defaultNow(),
});

export const fillups = pgTable("fillups", {
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
  createdAt: timestamp("created_at").defaultNow(),
});
