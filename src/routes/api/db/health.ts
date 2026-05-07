import { count } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '~/db/client'
import { users } from '~/db/schema'

export const Route = createFileRoute('/api/db/health')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const db = getDb()
          const [result] = await db.select({ count: count() }).from(users)

          return Response.json({
            ok: true,
            binding: 'DB',
            usersCount: result?.count ?? 0,
          })
        } catch (error) {
          return Response.json(
            {
              ok: false,
              binding: 'DB',
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to query D1',
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
