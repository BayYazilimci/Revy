import { useState, useEffect, useCallback } from 'react'
import { listsApi } from '../api/lists'

export function useLists() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listsApi.getAll()
      setData(result)
    } catch (err) {
      setError(err.message || 'Listeler yüklenirken hata oluştu')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const create = useCallback(async (name, desc) => {
    const list = await listsApi.create({ name, desc })
    setData(prev => [...prev, list])
    return list
  }, [])

  const update = useCallback(async (id, name, desc) => {
    const updated = await listsApi.update(id, { name, desc })
    setData(prev => prev.map(l => l.id === id ? updated : l))
    return updated
  }, [])

  const remove = useCallback(async (id) => {
    await listsApi.delete(id)
    setData(prev => prev.filter(l => l.id !== id))
  }, [])

  const addItem = useCallback(async (listId, propertyId) => {
    const updated = await listsApi.addItem(listId, propertyId)
    setData(prev => prev.map(l => l.id === listId ? updated : l))
  }, [])

  const removeItem = useCallback(async (listId, propertyId) => {
    const updated = await listsApi.removeItem(listId, propertyId)
    setData(prev => prev.map(l => l.id === listId ? updated : l))
  }, [])

  const refetch = useCallback(() => {
    fetch()
  }, [fetch])

  return {
    lists: data,
    loading,
    error,
    create,
    update,
    remove,
    addItem,
    removeItem,
    refetch,
  }
}
