import { drizzle } from 'drizzle-orm/d1'
import { env } from 'cloudflare:workers'
import { schema } from './schema'

export const getDb = (database: D1Database = env.DB) =>
  drizzle(database, { schema })
