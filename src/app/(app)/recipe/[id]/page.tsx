import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { RecipeDetailClient } from '@/components/recipe/recipe-detail-client'

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params

  const recipe = await prisma.recipe.findFirst({
    where: { id, userId: session.user.id }
  })

  if (!recipe) notFound()

  return <RecipeDetailClient recipe={JSON.parse(JSON.stringify(recipe))} />
}
