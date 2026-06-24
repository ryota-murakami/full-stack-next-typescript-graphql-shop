'use client';
/**
 * Search Component
 * Provides real-time search with debounced queries and dropdown results.
 * Uses useLazyQuery for on-demand fetching with a short debounce.
 */
import { useState, useEffect, useMemo } from 'react'
import { useLazyQuery } from "@apollo/client/react";
import { useRouter } from 'next/navigation'
import debounce from 'lodash.debounce'
import { SEARCH_ITEMS_QUERY } from '@/lib/graphql/queries'
import type { SearchItemsData } from '@/lib/graphql/types'
import { Input } from './ui/input'
import { Search as SearchIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const SEARCH_DEBOUNCE_MS = 350
const SEARCH_BLUR_CLOSE_MS = 200

export function Search() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const [searchItems, { loading, data }] = useLazyQuery<SearchItemsData>(
    SEARCH_ITEMS_QUERY,
    {
      fetchPolicy: 'network-only',
    }
  )

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        if (term.length >= 2) {
          searchItems({ variables: { searchTerm: term } })
        }
      }, SEARCH_DEBOUNCE_MS),
    [searchItems]
  )

  useEffect(() => {
    return () => debouncedSearch.cancel()
  }, [debouncedSearch])

  /**
   * Handle input change with debounced search
   * @param e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setIsOpen(value.length >= 2)
    debouncedSearch(value)
  }

  /**
   * Handle item selection from dropdown
   * @param itemId - Selected item ID
   */
  const handleSelect = (itemId: string) => {
    setSearchTerm('')
    setIsOpen(false)
    router.push(`/item/${itemId}`)
  }

  const items = data?.items || []

  return (
    <div className="relative">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items..."
          value={searchTerm}
          onChange={handleChange}
          onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), SEARCH_BLUR_CLOSE_MS)}
          className="w-64 pl-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          {items.length === 0 && !loading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No items found for &quot;{searchTerm}&quot;
            </div>
          )}
          {items.length > 0 && (
            <ul className="max-h-64 overflow-auto py-1">
              {items.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-accent',
                      index === 0 && 'rounded-t-md',
                      index === items.length - 1 && 'rounded-b-md'
                    )}
                  >
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      (<img
                        src={item.image}
                        alt=""
                        className="h-8 w-8 rounded object-cover"
                      />)
                    )}
                    <span className="flex-1 truncate">{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
