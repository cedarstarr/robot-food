import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'AI service not configured' }, { status: 503 })
  }

  const formData = await req.formData()
  const photo = formData.get('photo') as File | null
  if (!photo) return Response.json({ error: 'No photo provided' }, { status: 400 })

  if (photo.size > 5 * 1024 * 1024) {
    return Response.json({ error: 'Photo must be under 5MB' }, { status: 400 })
  }

  const arrayBuffer = await photo.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const mediaType = (photo.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif') || 'image/jpeg'

  const anthropic = new Anthropic({ apiKey })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 }
        },
        {
          type: 'text',
          text: 'Look at this fridge or pantry photo. List every food item and ingredient you can clearly identify. Return ONLY a JSON array of ingredient name strings, no quantities, no explanations, no markdown. Example: ["eggs", "cheddar cheese", "broccoli", "leftover rice"]. Return only the JSON array.'
        }
      ]
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') return Response.json({ ingredients: [] })

  try {
    const match = content.text.match(/\[[\s\S]*\]/)
    const ingredients = match ? JSON.parse(match[0]) : []
    return Response.json({ ingredients })
  } catch {
    return Response.json({ ingredients: [] })
  }
}
