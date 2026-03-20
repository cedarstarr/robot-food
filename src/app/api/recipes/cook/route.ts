import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'AI service not configured' }, { status: 503 })
  }

  const { suggestion, ingredients } = await req.json()
  if (!suggestion?.title) {
    return Response.json({ error: 'Invalid suggestion' }, { status: 400 })
  }

  const anthropic = new Anthropic({ apiKey })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `You are an expert chef. Generate a complete detailed recipe as JSON. Return ONLY valid JSON with no markdown, no code blocks.
Schema:
{
  "title": string,
  "description": string,
  "servings": number,
  "prepTimeMin": number,
  "cookTimeMin": number,
  "cuisine": string,
  "difficulty": "easy" | "medium" | "hard",
  "ingredients": [{"name": string, "amount": string, "unit": string}],
  "steps": [string],
  "notes": string,
  "nutrition": {"calories": number, "protein": number, "fat": number, "carbs": number, "fiber": number}
}`,
    messages: [{
      role: 'user',
      content: `Generate a full recipe for "${suggestion.title}". Description: ${suggestion.description}. Main ingredients available: ${ingredients.join(', ')}. Target servings: ${suggestion.servings || 4}.`
    }]
  })

  const content = response.content[0]
  if (content.type !== 'text') return Response.json({ error: 'Failed to generate recipe' }, { status: 500 })

  let recipeData
  try {
    const match = content.text.match(/\{[\s\S]*\}/)
    recipeData = match ? JSON.parse(match[0]) : null
    if (!recipeData) throw new Error('No JSON found')
  } catch {
    return Response.json({ error: 'Failed to parse recipe' }, { status: 500 })
  }

  const rawText = [
    `# ${recipeData.title}`,
    `\n${recipeData.description}`,
    `\n## Ingredients`,
    recipeData.ingredients.map((i: {amount: string, unit: string, name: string}) => `- ${i.amount} ${i.unit} ${i.name}`).join('\n'),
    `\n## Instructions`,
    recipeData.steps.map((s: string, i: number) => `${i+1}. ${s}`).join('\n'),
    recipeData.notes ? `\n## Notes\n${recipeData.notes}` : ''
  ].join('\n')

  const recipe = await prisma.recipe.create({
    data: {
      userId: session.user.id,
      title: recipeData.title,
      description: recipeData.description,
      servings: recipeData.servings,
      prepTimeMin: recipeData.prepTimeMin,
      cookTimeMin: recipeData.cookTimeMin,
      cuisine: recipeData.cuisine,
      difficulty: recipeData.difficulty,
      sourceIngredients: ingredients,
      recipeData: recipeData,
      rawText,
      nutrition: recipeData.nutrition,
    }
  })

  return Response.json({ id: recipe.id })
}
