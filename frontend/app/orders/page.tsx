import { OrderList } from '@/components/OrderList'

export const metadata = {
  title: 'Orders | Full-Stack Shop',
}

export default function OrdersPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Your Orders</h1>
      <OrderList />
    </div>
  )
}
