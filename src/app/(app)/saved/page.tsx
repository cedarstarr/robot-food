import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChefHat, BookOpen, Clock, ArrowRight } from 'lucide-react'
import { DeleteRecipeButton } from '@/components/recipe/delete-recipe-button'

export const metadata = { title: 'Saved Recipes — Robot Food' }

export default async function SavedPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const recipes = await prisma.recipe.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      cuisine: true,
      prepTimeMin: true,
      cookTimeMin: true,
      servings: true,
      createdAt: true,
    }
  })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Saved Recipes
          </h1>
          <p className="text-muted-foreground mt-1">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/kitchen">
            <ChefHat className="h-4 w-4 mr-2" />
            New Recipe
          </Link>
        </Button>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No saved recipes yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Head to the kitchen, add your ingredients, and cook your first recipe!
          </p>
          <Button asChild>
            <Link href="/kitchen">Go to Kitchen</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {recipes.map(recipe => {
            const totalMin = (recipe.prepTimeMin || 0) + (recipe.cookTimeMin || 0)
            return (
              <div key={recipe.id} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground leading-tight">{recipe.title}</h3>
                  <DeleteRecipeButton id={recipe.id} />
                </div>
                {recipe.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{recipe.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.cuisine && <Badge variant="secondary" className="text-xs">{recipe.cuisine}</Badge>}
                  {totalMin > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {totalMin}m
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{formatDate(recipe.createdAt)}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/recipe/${recipe.id}`}>
                      View Recipe
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
