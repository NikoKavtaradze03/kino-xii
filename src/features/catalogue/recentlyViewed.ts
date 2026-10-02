import { useSyncExternalStore } from 'react'
import type { Movie } from '@/shared/api/types'

// The API has no endpoint for this, so the list lives in this browser only.
const STORAGE_KEY = 'kino.recentlyViewed'
const MAX_ITEMS = 10

const listeners = new Set<() => void>()
let cache: Movie[] | null = null

function read(): Movie[] {
  if (cache) return cache
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    cache = Array.isArray(parsed) ? (parsed as Movie[]) : []
  } catch {
    cache = []
  }
  return cache
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Newest first, without duplicates. */
export function addRecentlyViewed(movie: Movie) {
  cache = [movie, ...read().filter((item) => item.id !== movie.id)].slice(0, MAX_ITEMS)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch {
    // Storage full or blocked: the list still works for this page load.
  }
  listeners.forEach((listener) => listener())
}

export function useRecentlyViewed() {
  return useSyncExternalStore(subscribe, read)
}
