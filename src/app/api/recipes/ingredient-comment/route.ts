import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return Response.json({ error: 'AI service not configured' }, { status: 503 })

  const { recipeTitle, ingredient, action } = await req.json()

  const anthropic = new Anthropic({ apiKey })

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `In the context of "${recipeTitle}", what is the effect of ${action === 'add' ? 'adding' : 'removing'} ${ingredient}? Reply in exactly 1-2 sentences focusing on flavor, texture, or nutrition. Be specific and helpful.`
    }]
  })

  const comment = response.content[0].type === 'text' ? response.content[0].text : ''
  return Response.json({ comment })
}
