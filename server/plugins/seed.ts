import { seedParticipants } from '../utils/seed-demo'

export default defineNitroPlugin(async () => {
  if (process.env.DATABASE_URL) {
    await seedParticipants()
  }
})
