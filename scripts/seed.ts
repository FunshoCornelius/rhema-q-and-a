import { ConvexHttpClient } from 'convex/browser'
import bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'
import { api } from '../convex/_generated/api.js'
import { CAMPUSES, LEVELS } from '../src/config/campuses.js'

// Load environment variables from .env.local or .env
dotenv.config({ path: '.env' })

const CONVEX_URL = process.env.VITE_CONVEX_URL

if (!CONVEX_URL) {
  console.error('❌ Missing VITE_CONVEX_URL environment variable.')
  process.exit(1)
}

const client = new ConvexHttpClient(CONVEX_URL)

async function seed() {
  console.log('🌱 Seeding the database with Admin accounts...')
  const defaultPassword =
    process.env.DEFAULT_ADMIN_PASSWORD || 'CampusAdmin123!'
  const passwordHash = await bcrypt.hash(defaultPassword, 10)

  let createdCount = 0

  for (const campus of CAMPUSES) {
    for (const level of LEVELS) {
      console.log(`Setting up Admin for ${campus.id} - ${level.id}...`)
      await client.mutation(api.admins.upsertAdmin, {
        campusId: campus.id,
        level: level.id,
        passwordHash: passwordHash,
      })
      createdCount++
    }
  }

  console.log(`✅ Successfully seeded/updated ${createdCount} admin accounts.`)
  console.log(
    `Default login password for campus admins is: "${defaultPassword}"`,
  )

  // Note: Super admin auth doesn't exist as a DB row; it uses SUPER_ADMIN_PASSWORD from .env
}

seed().catch(console.error)
