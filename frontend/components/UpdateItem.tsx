'use client';
/**
 * Update item form component
 */
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from 'next/navigation'
import { SINGLE_ITEM_QUERY } from '@/lib/graphql/queries'
import { UPDATE_ITEM_MUTATION } from '@/lib/graphql/mutations'
import type { SingleItemData } from '@/lib/graphql/types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent } from './ui/card'
import { Loader2 } from 'lucide-react'

interface UpdateItemProps {
  id: string
}

export function UpdateItem({ id }: UpdateItemProps) {
  const router = useRouter()
  const { data, loading: queryLoading } = useQuery<SingleItemData>(
    SINGLE_ITEM_QUERY,
    {
      variables: { id },
    }
  )

  const [updateItem, { loading: updateLoading, error }] = useMutation(
    UPDATE_ITEM_MUTATION,
    {
      onCompleted: () => {
        router.push(`/item/${id}`)
      },
    }
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = String(formData.get('title') ?? '')
    const description = String(formData.get('description') ?? '')
    const price = String(formData.get('price') ?? '0')

    updateItem({
      variables: {
        id,
        title,
        description,
        price: Math.round(parseFloat(price) * 100),
      },
    })
  }

  if (queryLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data?.item) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Item not found
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error.message}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              defaultValue={data.item.title}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={(data.item.price / 100).toString()}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              defaultValue={data.item.description}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={updateLoading}>
            {updateLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
