import { seedDemoUser } from '../utils/users'
import { seedMarketplace, seedDemoParticipant } from '../utils/seed-demo'

export default defineNitroPlugin(async () => {
  if (process.env.DATABASE_URL) {
    await seedDemoUser()
    await seedMarketplace()
    await seedDemoParticipant()
  }
})
