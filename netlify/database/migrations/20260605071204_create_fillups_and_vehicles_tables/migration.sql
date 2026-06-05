CREATE TABLE "fillups" (
	"id" serial PRIMARY KEY,
	"vehicle_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"fillup_date" date NOT NULL,
	"fillup_time" text NOT NULL,
	"fuel_price" numeric(10,2) NOT NULL,
	"amount_paid" numeric(10,2) NOT NULL,
	"fuel_quantity" numeric(10,3) NOT NULL,
	"odometer_reading" numeric(10,1) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"vehicle_type" text NOT NULL,
	"fuel_type" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "fillups" ADD CONSTRAINT "fillups_vehicle_id_vehicles_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE;