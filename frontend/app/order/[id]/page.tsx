import { Order } from '@/components/Order'

export const metadata = {
  title: 'Order Details | Full-Stack Shop',
}

interface OrderPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Order Detail Page
 * Displays details for a single order including items, totals, and timestamps.
 * @param params - Route parameters containing the order ID
 */
export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Order #{id.slice(-8).toUpperCase()}</h1>
      <Order id={id} />
    </div>
  )
}
