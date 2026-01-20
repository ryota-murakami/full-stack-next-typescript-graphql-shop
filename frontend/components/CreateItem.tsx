'use client'

/**
 * Create item form component
 */
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { CREATE_ITEM_MUTATION } from '@/lib/graphql/mutations'
import { ALL_ITEMS_QUERY } from '@/lib/graphql/queries'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent } from './ui/card'
import { Loader2 } from 'lucide-react'

export function CreateItem() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState('')
  const [largeImage, setLargeImage] = useState('')
  const [uploading, setUploading] = useState(false)

  const [createItem, { loading, error }] = useMutation(CREATE_ITEM_MUTATION, {
    refetchQueries: [{ query: ALL_ITEMS_QUERY }],
    onCompleted: (data) => {
      router.push(`/item/${data.createItem.id}`)
    },
  })

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    const data = new FormData()
    data.append('file', files[0])
    data.append('upload_preset', 'sickfits')

    try {
      const res = await fetch(
        'https://api.cloudinary.com/v1_1/wesbos/image/upload',
        {
          method: 'POST',
          body: data,
        }
      )
      const file = await res.json()
      setImage(file.secure_url)
      setLargeImage(file.eager?.[0]?.secure_url || file.secure_url)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createItem({
      variables: {
        title,
        description,
        price: Math.round(parseFloat(price) * 100), // Convert to cents
        image,
        largeImage,
      },
    })
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
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={uploadFile}
              disabled={uploading}
            />
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </div>
            )}
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="Upload preview" className="h-32 rounded-md" />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Item title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Describe your item"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || uploading}>
            {loading ? 'Creating...' : 'Create Item'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
