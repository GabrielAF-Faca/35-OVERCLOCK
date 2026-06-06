import { seedDemoUser } from '../utils/users'

export default defineNitroPlugin(async () => {
  if (process.env.DATABASE_URL) {
    await seedDemoUser()
  }
})
