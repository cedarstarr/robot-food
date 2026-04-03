import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'
import { aiLimiter } from '@/lib/rate-limit'

export const maxDuration = 30

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success } = await aiLimiter.check(ip)
  if (!success) return new Response('Too many requests', { status: 429 })

  const { id } = await params
  const recipe = await prisma.recipe.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { missingIngredient } = await req.json()
  if (!missingIngredient) {
    return NextResponse.json({ error: 'missingIngredient is required' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return new Response('AI service not configured', { status: 503 })

  const anthropic = new Anthropic({ apiKey })

  interface RecipeDataShape {
    title?: string
    ingredients?: Array<{ name: string; amount: string; unit: string }>
    steps?: string[]
  }
  const recipeData = recipe.recipeData as RecipeDataShape

  const ingredientList = recipeData.ingredients
    ? recipeData.ingredients.map(i => `${i.amount} ${i.unit} ${i.name}`.trim()).join(', ')
    : recipe.sourceIngredients.join(', ')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    system: `You are a professional chef and food scientist. Analyze the role an ingredient plays in a recipe and suggest practical substitutions. Respond with valid JSON only, no markdown fences:
{
  "role": "one sentence describing what role this ingredient plays (e.g., binder, acid, fat, leavener, flavor base)",
  "substitutions": [
    {
      "name": "substitute ingredient name",
      "quantity": "adjusted quantity with unit",
      "flavorImpact": "how it changes the flavor (1-2 sentences)",
      "textureImpact": "how it changes the texture (1 sentence)",
      "confidence": "works_great" | "works_ok" | "last_resort",
      "techniqueNote": "any technique adjustment needed, or null"
    }
  ],
  "tip": "brief chef's tip about the substitution"
}`,
    messages: [{
      role: 'user',
      content: `Recipe: ${recipeData.title || recipe.title}
All ingredients: ${ingredientList}
Missing ingredient: ${missingIngredient}

Analyze what role "${missingIngredient}" plays in this specific recipe and suggest 2-3 substitutions ordered from best to last resort.`,
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Failed to parse substitutions' }, { status: 500 })
  }

  try {
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch {
    return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 500 })
  }
}
