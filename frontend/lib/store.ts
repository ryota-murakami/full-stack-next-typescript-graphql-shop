/**
 * Zustand store for client-side state management
 * Replaces Apollo Client's @client directives
 */
import { create } from 'zustand'

/**
 * Cart UI state
 */
interface CartState {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

export const useCartStore = create<CartState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))

/**
 * Search UI state
 */
interface SearchState {
  isOpen: boolean
  query: string
  toggle: () => void
  open: () => void
  close: () => void
  setQuery: (query: string) => void
  reset: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  query: '',
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setQuery: (query) => set({ query }),
  reset: () => set({ isOpen: false, query: '' }),
}))
