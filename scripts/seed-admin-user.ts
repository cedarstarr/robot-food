import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'cedarbarrett@gmail.com'
  const password = 'CedarAdmin2026!'
  const hash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: { isAdmin: true },
    create: {
      email,
      name: 'Cedar Barrett',
      password: hash,
      isAdmin: true,
      emailVerified: new Date(),
    }
  })

  console.log('Admin user seeded:', user.email)
}

main().catch(console.error).finally(() => prisma.$disconnect())
