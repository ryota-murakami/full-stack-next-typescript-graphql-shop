import { CreateItem } from '@/components/CreateItem'

export const metadata = {
  title: 'Sell Item | Full-Stack Shop',
}

export default function SellPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Sell an Item</h1>
      <CreateItem />
    </div>
  )
}
