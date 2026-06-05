import { createFileRoute } from '@tanstack/react-router'
import { getUser } from '@netlify/identity'
import { db } from '../../../db/index.js'
import { fillups, vehicles } from '../../../db/schema.js'
import { eq, and, desc, gte, lte } from 'drizzle-orm'

export const Route = createFileRoute('/api/fillups')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getUser()
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
        const url = new URL(request.url)
        const vehicleId = url.searchParams.get('vehicleId')
        const dateFrom = url.searchParams.get('dateFrom')
        const dateTo = url.searchParams.get('dateTo')

        const conditions = [eq(fillups.userId, user.id)]
        if (vehicleId) conditions.push(eq(fillups.vehicleId, parseInt(vehicleId)))
        if (dateFrom) conditions.push(gte(fillups.fillupDate, dateFrom))
        if (dateTo) conditions.push(lte(fillups.fillupDate, dateTo))

        const rows = await db
          .select({
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
            fuelType: vehicles.fuelType,
          })
          .from(fillups)
          .innerJoin(vehicles, eq(fillups.vehicleId, vehicles.id))
          .where(and(...conditions))
          .orderBy(desc(fillups.fillupDate), desc(fillups.fillupTime))

        // Compute distance and mileage for each record
        const enriched = await Promise.all(
          rows.map(async (row) => {
            // Get previous fillup for this vehicle to compute distance
            const [prev] = await db
              .select({ odometerReading: fillups.odometerReading })
              .from(fillups)
              .where(
                and(
                  eq(fillups.vehicleId, row.vehicleId),
                  eq(fillups.userId, user.id),
                  lte(fillups.fillupDate, row.fillupDate),
                )
              )
              .orderBy(desc(fillups.fillupDate), desc(fillups.fillupTime))
              .limit(2)
              .then((r) => r.filter((x) => x.odometerReading !== row.odometerReading)[0]
                ? [r.filter((x) => x.odometerReading !== row.odometerReading)[0]]
                : [null])
              .then((r) => r)

            const distance = prev
              ? parseFloat(row.odometerReading) - parseFloat(prev.odometerReading as string)
              : null
            const qty = parseFloat(row.fuelQuantity)
            const mileage = distance && qty > 0 ? distance / qty : null

            return { ...row, distance, mileage }
          })
        )

        return Response.json(enriched)
      },
      POST: async ({ request }) => {
        const user = await getUser()
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
        const body = await request.json()
        const { vehicleId, fillupDate, fillupTime, fuelPrice, amountPaid, fuelQuantity, odometerReading, notes } = body
        if (!vehicleId || !fillupDate || !fillupTime || !fuelPrice || !amountPaid || !fuelQuantity || !odometerReading) {
          return Response.json({ error: 'Missing required fields' }, { status: 400 })
        }
        // Verify vehicle belongs to user
        const [vehicle] = await db.select().from(vehicles).where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, user.id)))
        if (!vehicle) return Response.json({ error: 'Vehicle not found' }, { status: 404 })

        const [row] = await db.insert(fillups).values({
          vehicleId,
          userId: user.id,
          fillupDate,
          fillupTime,
          fuelPrice: String(fuelPrice),
          amountPaid: String(amountPaid),
          fuelQuantity: String(fuelQuantity),
          odometerReading: String(odometerReading),
          notes: notes || null,
        }).returning()
        return Response.json(row, { status: 201 })
      },
    },
  },
})
