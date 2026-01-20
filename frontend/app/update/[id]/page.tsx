import { UpdateItem } from '@/components/UpdateItem'

interface UpdatePageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Update Item | Full-Stack Shop',
}

export default async function UpdatePage({ params }: UpdatePageProps) {
  const { id } = await params

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Update Item</h1>
      <UpdateItem id={id} />
    </div>
  )
}
