import { Items } from '@/components/Items'
import { Pagination } from '@/components/Pagination'

interface HomePageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1

  return (
    <div className="space-y-8">
      <Pagination page={page} />
      <Items page={page} />
      <Pagination page={page} />
    </div>
  )
}
