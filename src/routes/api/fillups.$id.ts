import { createFileRoute } from '@tanstack/react-router'
import { getUser } from '@netlify/identity'
import { db } from '../../../db/index.js'
import { fillups, vehicles } from '../../../db/schema.js'
import { eq, and } from 'drizzle-orm'

export const Route = createFileRoute('/api/fillups/$id')({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        const user = await getUser()
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
        const id = parseInt(params.id)
        const body = await request.json()
        const { vehicleId, fillupDate, fillupTime, fuelPrice, amountPaid, fuelQuantity, odometerReading, notes } = body

        // Verify vehicle belongs to user
        if (vehicleId) {
          const [vehicle] = await db.select().from(vehicles).where(and(eq(vehicles.id, vehicleId), eq(vehicles.userId, user.id)))
          if (!vehicle) return Response.json({ error: 'Vehicle not found' }, { status: 404 })
        }

        const [row] = await db.update(fillups).set({
          vehicleId,
          fillupDate,
          fillupTime,
          fuelPrice: String(fuelPrice),
          amountPaid: String(amountPaid),
          fuelQuantity: String(fuelQuantity),
          odometerReading: String(odometerReading),
          notes: notes || null,
        }).where(and(eq(fillups.id, id), eq(fillups.userId, user.id))).returning()
        if (!row) return Response.json({ error: 'Not found' }, { status: 404 })
        return Response.json(row)
      },
      DELETE: async ({ params }) => {
        const user = await getUser()
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
        const id = parseInt(params.id)
        await db.delete(fillups).where(and(eq(fillups.id, id), eq(fillups.userId, user.id)))
        return new Response(null, { status: 204 })
      },
    },
  },
})
