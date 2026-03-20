import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('Test1234!', 12)

  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      name: 'Test User',
      password: hash,
      emailVerified: new Date(),
    }
  })

  console.log('Test user seeded:', user.email)
}

main().catch(console.error).finally(() => prisma.$disconnect())
