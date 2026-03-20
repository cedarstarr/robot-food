import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendAccountDeletedEmail } from '@/lib/email'
import { logAuditEvent } from '@/lib/audit'
import bcrypt from 'bcryptjs'

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const { password } = body ?? {}
  if (!password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.password) {
    return NextResponse.json({ error: 'No password set' }, { status: 400 })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
  }

  void logAuditEvent(session.user.id, 'account_delete', null)

  await prisma.user.delete({ where: { id: session.user.id } })

  try {
    await sendAccountDeletedEmail(user.email, user.name ?? undefined)
  } catch { /* silent */ }

  return NextResponse.json({ message: 'Account deleted' })
}
