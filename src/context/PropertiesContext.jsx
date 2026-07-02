import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { propertiesApi } from '../api/properties'

export const CATEGORIES = ['Tümü', 'Satılık', 'Kiralık', 'Villa', 'Daire']

const PropertiesContext = createContext(null)

export function PropertiesProvider({ children }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    propertiesApi.getAll()
      .then(res => { if (alive) setList(res.data || []) })
      .catch(err => { if (alive) setError(err.message || 'İlanlar yüklenemedi') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const value = useMemo(() => {
    const properties = {}
    list.forEach(p => { properties[p.id] = p })
    return {
      properties,
      propertyList: list.filter(p => p.listOrder != null),
      dailyProperties: list.filter(p => p.isDaily),
      allProperties: list,
      categories: CATEGORIES,
      loading,
      error,
    }
  }, [list, loading, error])

  return <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>
}

export function usePropertyData() {
  const ctx = useContext(PropertiesContext)
  if (!ctx) throw new Error('usePropertyData must be used within PropertiesProvider')
  return ctx
}
