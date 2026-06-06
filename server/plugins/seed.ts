import { seedDemoUser } from '../utils/users'
import { seedMarketplace } from '../utils/seed-demo'

export default defineNitroPlugin(async () => {
  if (process.env.DATABASE_URL) {
    await seedDemoUser()
    await seedMarketplace()
  }
})
