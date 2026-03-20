import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { notifyMarketing: true, notifyProduct: true },
  })

  return NextResponse.json(user)
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { notifyMarketing, notifyProduct } = await request.json()

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(typeof notifyMarketing === 'boolean' && { notifyMarketing }),
      ...(typeof notifyProduct === 'boolean' && { notifyProduct }),
    },
  })

  return NextResponse.json({ message: 'Preferences updated' })
}
