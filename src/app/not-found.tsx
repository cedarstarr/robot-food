import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChefHat } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ChefHat className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-3">Page not found</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Looks like this recipe doesn&apos;t exist. Let&apos;s get you back to the kitchen.
        </p>
        <Button asChild>
          <Link href="/kitchen">Go to Kitchen</Link>
        </Button>
      </div>
    </div>
  )
}
