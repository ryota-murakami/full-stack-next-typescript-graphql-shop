/**
 * GraphQL Type Definitions
 */

export type Permission =
  | 'ADMIN'
  | 'USER'
  | 'ITEMCREATE'
  | 'ITEMUPDATE'
  | 'ITEMDELETE'
  | 'PERMISSIONUPDATE'

export interface User {
  id: string
  name: string
  email: string
  permissions: Permission[]
  cart: CartItem[]
}

export interface Item {
  id: string
  title: string
  description: string
  image?: string | null
  largeImage?: string | null
  price: number
  user?: { id: string } | null
}

export interface CartItem {
  id: string
  quantity: number
  item?: Item | null
}

export interface OrderItem {
  id: string
  title: string
  description: string
  image: string
  largeImage: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  user: User
  charge: string
  createdAt: string
  updatedAt: string
}

// Query result types
export interface CurrentUserData {
  me: User | null
}

export interface AllItemsData {
  items: Item[]
}

export interface SingleItemData {
  item: Item | null
}

export interface PaginationData {
  itemsConnection: {
    aggregate: {
      count: number
    }
  }
}

export interface SearchItemsData {
  items: Array<{
    id: string
    title: string
    image?: string | null
  }>
}

export interface AllUsersData {
  users: User[]
}

export interface SingleOrderData {
  order: Order
}

export interface UserOrdersData {
  orders: Order[]
}

export interface CreateOrderData {
  createOrder: {
    id: string
    charge: string
    total: number
    items: Array<{
      id: string
      title: string
    }>
  }
}
