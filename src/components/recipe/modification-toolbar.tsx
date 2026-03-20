'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Flame, Droplets, Users, Utensils } from 'lucide-react'

interface Props {
  recipeId: string
  servings: number
  onModified: (action: string, options: Record<string, unknown>) => void
}

export function ModificationToolbar({ recipeId, servings, onModified }: Props) {
  const [targetServings, setTargetServings] = useState(servings)
  const [targetMethod, setTargetMethod] = useState('original')

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <h3 className="text-sm font-medium text-foreground mb-3">Customize Recipe</h3>
      <div className="flex flex-wrap gap-3 items-end">
        {/* Lower calories */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onModified('lower_calories', {})}
          className="gap-2"
        >
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          Lower Calories
        </Button>

        {/* Reduce fat */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onModified('reduce_fat', {})}
          className="gap-2"
        >
          <Droplets className="h-3.5 w-3.5 text-blue-500" />
          Reduce Fat
        </Button>

        {/* Servings */}
        <div className="flex items-end gap-2 min-w-[160px]">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1.5 block">
              Servings: {targetServings}
            </label>
            <Slider
              min={1}
              max={12}
              step={1}
              value={[targetServings]}
              onValueChange={([v]) => setTargetServings(v)}
              className="w-full"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onModified('change_servings', { targetServings })}
            className="gap-2 shrink-0"
          >
            <Users className="h-3.5 w-3.5" />
            Apply
          </Button>
        </div>

        {/* Cooking method */}
        <div className="flex items-end gap-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Method</label>
            <Select value={targetMethod} onValueChange={setTargetMethod}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original</SelectItem>
                <SelectItem value="Bake">Bake</SelectItem>
                <SelectItem value="Air-Fry">Air-Fry</SelectItem>
                <SelectItem value="Grill">Grill</SelectItem>
                <SelectItem value="Slow Cook">Slow Cook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onModified('change_method', { targetMethod })}
            disabled={targetMethod === 'original'}
            className="gap-2 shrink-0"
          >
            <Utensils className="h-3.5 w-3.5" />
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}
