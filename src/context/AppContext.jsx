import { createContext, useContext, useState, useCallback } from 'react'
import { defaultLists, FAVORITES_LIST_ID, MY_LISTINGS_ID } from '../data/lists'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [lists, setLists] = useState(defaultLists)
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((msg, type = 'default') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const isInFavorites = useCallback((propId) => {
    const favList = lists[FAVORITES_LIST_ID]
    return favList ? favList.items.includes(propId) : false
  }, [lists])

  const toggleFavorite = useCallback((propId) => {
    setLists(prev => {
      const favList = prev[FAVORITES_LIST_ID]
      if (!favList) {
        return {
          ...prev,
          [FAVORITES_LIST_ID]: {
            id: FAVORITES_LIST_ID, name: 'Favoriler',
            desc: 'Favori ilanlarınız', items: [propId],
            color: '#e3d10d', icon: 'heart'
          }
        }
      }
      if (favList.items.includes(propId)) {
        return {
          ...prev,
          [FAVORITES_LIST_ID]: {
            ...favList,
            items: favList.items.filter(i => i !== propId)
          }
        }
      }
      return {
        ...prev,
        [FAVORITES_LIST_ID]: {
          ...favList,
          items: [...favList.items, propId]
        }
      }
    })
  }, [])

  const createList = useCallback((name, desc) => {
    const id = 'l' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    const colors = ['#1e1b2e', '#e3d10d', '#3b82f6', '#8b5cf6', '#dc2626', '#059669', '#d97706']
    const icons = ['heart', 'home', 'trending-up', 'umbrella', 'building-2', 'sparkles', 'star']
    setLists(prev => ({
      ...prev,
      [id]: { id, name, desc, items: [], color: colors[Math.floor(Math.random() * colors.length)], icon: icons[Math.floor(Math.random() * icons.length)], notes: {} }
    }))
    return id
  }, [])

  const editList = useCallback((id, name, desc) => {
    setLists(prev => prev[id] ? { ...prev, [id]: { ...prev[id], name, desc } } : prev)
  }, [])

  const deleteList = useCallback((id) => {
    setLists(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const addToList = useCallback((listId, propId) => {
    setLists(prev => {
      if (!prev[listId] || prev[listId].items.includes(propId)) return prev
      return { ...prev, [listId]: { ...prev[listId], items: [...prev[listId].items, propId] } }
    })
  }, [])

  const getOrCreateList = useCallback((name) => {
    const existing = Object.values(lists).find(l => l.name === name)
    if (existing) return existing.id
    return createList(name, '')
  }, [lists, createList])

  const removeFromList = useCallback((listId, propId) => {
    setLists(prev => {
      if (!prev[listId]) return prev
      const { [propId]: _, ...restNotes } = prev[listId].notes || {}
      return { ...prev, [listId]: { ...prev[listId], items: prev[listId].items.filter(i => i !== propId), notes: restNotes } }
    })
  }, [])

  const isInMyListings = useCallback((propId) => {
    const list = lists[MY_LISTINGS_ID]
    return list ? list.items.includes(propId) : false
  }, [lists])

  const toggleMyListing = useCallback((propId) => {
    setLists(prev => {
      const list = prev[MY_LISTINGS_ID]
      if (!list) {
        return {
          ...prev,
          [MY_LISTINGS_ID]: {
            id: MY_LISTINGS_ID, name: 'Portföyüm',
            desc: 'Kaydettiğiniz ilanlar (Portföyüm)', items: [propId],
            color: '#059669', icon: 'bookmark', notes: {}
          }
        }
      }
      if (list.items.includes(propId)) {
        const { [propId]: _, ...restNotes } = list.notes || {}
        return {
          ...prev,
          [MY_LISTINGS_ID]: {
            ...list,
            items: list.items.filter(i => i !== propId),
            notes: restNotes
          }
        }
      }
      return {
        ...prev,
        [MY_LISTINGS_ID]: {
          ...list,
          items: [...list.items, propId],
          notes: { ...(list.notes || {}), [propId]: '' }
        }
      }
    })
  }, [])

  const updateItemNote = useCallback((listId, propId, note) => {
    setLists(prev => {
      if (!prev[listId]) return prev
      return {
        ...prev,
        [listId]: {
          ...prev[listId],
          notes: { ...(prev[listId].notes || {}), [propId]: note }
        }
      }
    })
  }, [])

  return (
    <AppContext.Provider value={{
      isInFavorites, toggleFavorite, toasts, addToast,
      lists, createList, editList, deleteList,
      addToList, removeFromList, getOrCreateList,
      isInMyListings, toggleMyListing, updateItemNote
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
