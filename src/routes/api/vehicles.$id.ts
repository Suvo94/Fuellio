import { createFileRoute } from '@tanstack/react-router'
import { getUser } from '@netlify/identity'
import { db } from '../../../db/index.js'
import { vehicles } from '../../../db/schema.js'
import { eq, and } from 'drizzle-orm'

export const Route = createFileRoute('/api/vehicles/$id')({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        const user = await getUser()
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
        const id = parseInt(params.id)
        const body = await request.json()
        const { name, vehicleType, fuelType } = body
        const [row] = await db.update(vehicles)
          .set({ name, vehicleType, fuelType })
          .where(and(eq(vehicles.id, id), eq(vehicles.userId, user.id)))
          .returning()
        if (!row) return Response.json({ error: 'Not found' }, { status: 404 })
        return Response.json(row)
      },
      DELETE: async ({ params }) => {
        const user = await getUser()
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
        const id = parseInt(params.id)
        await db.delete(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.userId, user.id)))
        return new Response(null, { status: 204 })
      },
    },
  },
})
