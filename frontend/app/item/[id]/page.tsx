import { SingleItem } from '@/components/SingleItem'

interface ItemPageProps {
  params: Promise<{ id: string }>
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params

  return (
    <div>
      <SingleItem id={id} />
    </div>
  )
}
