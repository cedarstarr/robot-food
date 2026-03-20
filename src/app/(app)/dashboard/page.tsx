import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChefHat, BookOpen, ArrowRight, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Dashboard — Robot Food' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const [recentRecipes, totalCount] = await Promise.all([
    prisma.recipe.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, cuisine: true, prepTimeMin: true, cookTimeMin: true, createdAt: true }
    }),
    prisma.recipe.count({ where: { userId: session.user.id } })
  ])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back{session.user.name ? `, ${session.user.name}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">
          You have <strong>{totalCount}</strong> saved recipe{totalCount !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Start Cooking</h3>
              <p className="text-xs text-muted-foreground">Generate new recipes from your ingredients</p>
            </div>
          </div>
          <Button asChild className="w-full">
            <Link href="/kitchen">
              Go to Kitchen
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Saved Recipes</h3>
              <p className="text-xs text-muted-foreground">{totalCount} recipe{totalCount !== 1 ? 's' : ''} in your collection</p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/saved">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent recipes */}
      {recentRecipes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Recipes</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/saved">View all</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recentRecipes.map(recipe => {
              const totalMin = (recipe.prepTimeMin || 0) + (recipe.cookTimeMin || 0)
              return (
                <Link
                  key={recipe.id}
                  href={`/recipe/${recipe.id}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all duration-200 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {recipe.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {recipe.cuisine && <Badge variant="secondary" className="text-xs">{recipe.cuisine}</Badge>}
                      {totalMin > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {totalMin}m
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(recipe.createdAt)}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
