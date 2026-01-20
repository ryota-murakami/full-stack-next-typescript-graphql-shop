import { Items } from '@/components/Items'
import { Pagination } from '@/components/Pagination'

interface ItemsPageProps {
  searchParams: Promise<{ page?: string }>
}

export const metadata = {
  title: 'Shop | Full-Stack Shop',
}

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Shop</h1>
      <Pagination page={page} />
      <Items page={page} />
      <Pagination page={page} />
    </div>
  )
}
