import { createFileRoute } from '@tanstack/react-router'
import { getUser } from '@netlify/identity'
import { db } from '../../../db/index.js'
import { vehicles } from '../../../db/schema.js'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/vehicles')({
  server: {
    handlers: {
      GET: async () => {
        const user = await getUser()
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
        const rows = await db.select().from(vehicles).where(eq(vehicles.userId, user.id))
        return Response.json(rows)
      },
      POST: async ({ request }) => {
        const user = await getUser()
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
        const body = await request.json()
        const { name, vehicleType, fuelType } = body
        if (!name || !vehicleType || !fuelType) {
          return Response.json({ error: 'Missing fields' }, { status: 400 })
        }
        const [row] = await db.insert(vehicles).values({
          userId: user.id,
          name,
          vehicleType,
          fuelType,
        }).returning()
        return Response.json(row, { status: 201 })
      },
    },
  },
})
