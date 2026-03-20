import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60

export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()

  // Day 1: users created in last 25 hours who haven't received a drip yet
  // (Just log for now — email templates exist for future use)
  const oneDayAgo = new Date(Date.now() - 25 * 3600 * 1000)
  const newUsers = await prisma.user.findMany({
    where: {
      createdAt: { gte: oneDayAgo },
      notifyMarketing: true,
      emailVerified: { not: null },
    },
    select: { id: true, email: true, name: true }
  })

  // Log job run
  await prisma.jobRun.create({
    data: {
      job: 'welcome-drip',
      trigger: 'cron',
      finishedAt: new Date(),
      durationMs: Date.now() - start,
      success: true,
      result: { newUsers: newUsers.length }
    }
  })

  return NextResponse.json({
    ok: true,
    processed: newUsers.length
  })
}
