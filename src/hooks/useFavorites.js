import { useMemo, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { FAVORITES_LIST_ID } from '../data/lists'

export function useFavorites() {
  const { lists, toggleFavorite, isInFavorites } = useApp()

  const favoriteIds = useMemo(() => {
    const favList = lists[FAVORITES_LIST_ID]
    return favList ? [...favList.items] : []
  }, [lists])

  const count = favoriteIds.length

  const toggle = useCallback((id) => {
    toggleFavorite(id)
  }, [toggleFavorite])

  return { favoriteIds, count, toggle, isInFavorites }
}
