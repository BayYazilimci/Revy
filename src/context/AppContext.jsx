import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { listsApi } from '../api/lists'
import { FAVORITES_LIST_ID, MY_LISTINGS_ID } from '../data/lists'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [lists, setLists] = useState({})
  const [toasts, setToasts] = useState([])
  const [listsLoaded, setListsLoaded] = useState(false)
  const [portfolioListId, setPortfolioListId] = useState(null)

  useEffect(() => {
    listsApi.getAll()
      .then(listArray => {
        const map = {}
        let foundPortfolioUuid = null
        for (const l of listArray) {
          const notesMap = {}
          for (const item of l.items) {
            if (item.notes) {
              notesMap[item.propertyId] = item.notes
            }
          }
          const isPortfolio = l.name === 'Portföyüm'
          if (isPortfolio) {
            foundPortfolioUuid = l.id
          }
          const key = isPortfolio ? MY_LISTINGS_ID : l.id
          map[key] = {
            id: key,
            _uuid: l.id,
            name: l.name,
            desc: '',
            items: l.items.map(i => i.propertyId),
            color: l.color || '#1e1b2e',
            icon: l.icon || 'heart',
            notes: notesMap,
          }
        }
        if (foundPortfolioUuid) {
          setPortfolioListId(foundPortfolioUuid)
        }
        setLists(map)
        setListsLoaded(true)
      })
      .catch(() => setListsLoaded(true))
  }, [])

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
      if (favList && favList.items.includes(propId)) {
        listsApi.removeItem(FAVORITES_LIST_ID, propId).catch(() => {})
        return {
          ...prev,
          [FAVORITES_LIST_ID]: {
            ...favList,
            items: favList.items.filter(i => i !== propId)
          }
        }
      }
      listsApi.addItem(FAVORITES_LIST_ID, propId).catch(() => {})
      return {
        ...prev,
        [FAVORITES_LIST_ID]: favList
          ? { ...favList, items: [...favList.items, propId] }
          : { id: FAVORITES_LIST_ID, name: 'Favoriler', desc: 'Favori ilanlarınız', items: [propId], color: '#e3d10d', icon: 'heart', notes: {} }
      }
    })
  }, [])

  const createList = useCallback(async (name, desc) => {
    const list = await listsApi.create({ name })
    setLists(prev => ({
      ...prev,
      [list.id]: { id: list.id, name, desc, items: [], color: list.color || '#1e1b2e', icon: list.icon || 'heart', notes: {} }
    }))
    return list.id
  }, [])

  const editList = useCallback(async (id, name, desc) => {
    await listsApi.update(id, { name })
    setLists(prev => prev[id] ? { ...prev, [id]: { ...prev[id], name } } : prev)
  }, [])

  const deleteList = useCallback(async (id) => {
    await listsApi.delete(id)
    setLists(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const addToList = useCallback((listId, propId) => {
    listsApi.addItem(listId, propId).catch(() => {})
    setLists(prev => {
      if (!prev[listId] || prev[listId].items.includes(propId)) return prev
      return { ...prev, [listId]: { ...prev[listId], items: [...prev[listId].items, propId] } }
    })
  }, [])

  const getOrCreateList = useCallback(async (name) => {
    const existing = Object.values(lists).find(l => l.name === name)
    if (existing) return existing.id
    return createList(name, '')
  }, [lists, createList])

  const removeFromList = useCallback((listId, propId) => {
    listsApi.removeItem(listId, propId).catch(() => {})
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
      const uuid = portfolioListId || list?._uuid
      if (list && list.items.includes(propId)) {
        if (uuid) listsApi.removeItem(uuid, propId).catch(() => {})
        const { [propId]: _, ...restNotes } = list.notes || {}
        return { ...prev, [MY_LISTINGS_ID]: { ...list, items: list.items.filter(i => i !== propId), notes: restNotes } }
      }
      if (uuid) listsApi.addItem(uuid, propId).catch(() => {})
      return {
        ...prev,
        [MY_LISTINGS_ID]: list
          ? { ...list, items: [...list.items, propId], notes: { ...(list.notes || {}), [propId]: '' } }
          : { id: MY_LISTINGS_ID, _uuid: uuid, name: 'Portföyüm', desc: 'Kaydettiğiniz ilanlar (Portföyüm)', items: [propId], color: '#059669', icon: 'bookmark', notes: {} }
      }
    })
  }, [portfolioListId])

  const updateItemNote = useCallback((listId, propId, note) => {
    setLists(prev => {
      if (!prev[listId]) return prev
      return { ...prev, [listId]: { ...prev[listId], notes: { ...(prev[listId].notes || {}), [propId]: note } } }
    })
    const uuid = listId === MY_LISTINGS_ID ? portfolioListId : listId
    if (uuid) listsApi.updateItemNote(uuid, propId, note).catch(() => {})
  }, [portfolioListId])

  return (
    <AppContext.Provider value={{
      isInFavorites, toggleFavorite, toasts, addToast,
      lists, createList, editList, deleteList,
      addToList, removeFromList, getOrCreateList,
      isInMyListings, toggleMyListing, updateItemNote,
      listsLoaded,
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
