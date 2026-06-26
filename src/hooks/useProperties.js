import { useState, useEffect, useCallback } from 'react'
import { propertiesApi } from '../api/properties'

export function useProperties(initialParams = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await propertiesApi.getAll(params)
      setData(result.data || result)
    } catch (err) {
      setError(err.message || 'İlanlar yüklenirken hata oluştu')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetch()
  }, [fetch])

  const refetch = useCallback(() => {
    fetch()
  }, [fetch])

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }))
  }, [])

  return { data, loading, error, refetch, updateParams, params }
}

export function useProperty(id) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError('İlan ID gerekli')
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    propertiesApi.getById(id)
      .then(result => {
        if (!cancelled) setData(result)
      })
      .catch(err => {
        if (!cancelled) setError(err.message || 'İlan yüklenirken hata oluştu')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  return { data, loading, error }
}
