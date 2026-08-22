import { useEffect, useState } from 'react'

export const FAVORITES_STORAGE_KEY = 'bookvault-favorites'

export function getFavoriteIds(): number[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!storedFavorites) {
      return []
    }

    const parsedFavorites: unknown = JSON.parse(storedFavorites)
    if (!Array.isArray(parsedFavorites)) {
      return []
    }

    return parsedFavorites.filter(
      (id): id is number => typeof id === 'number' && Number.isInteger(id),
    )
  } catch {
    return []
  }
}

function saveFavoriteIds(ids: number[]) {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Ignore storage failures so favorites remain usable in restricted browsers.
  }
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>(getFavoriteIds)

  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === FAVORITES_STORAGE_KEY) {
        setFavoriteIds(getFavoriteIds())
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  function toggleFavorite(id: number) {
    const nextIds = favoriteIds.includes(id)
      ? favoriteIds.filter((favoriteId) => favoriteId !== id)
      : [...favoriteIds, id]

    saveFavoriteIds(nextIds)
    setFavoriteIds(nextIds)
  }

  return { favoriteIds, toggleFavorite }
}