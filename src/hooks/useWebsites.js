import { useState, useEffect, useCallback } from 'react'
import { websitesApi } from '../api/websites'

export function useWebsites() {
  const [websites, setWebsites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWebsites = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await websitesApi.getAll()
      setWebsites(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWebsites()
  }, [fetchWebsites])

  const createWebsite = useCallback(async (websiteData) => {
    const created = await websitesApi.create(websiteData)
    setWebsites(prev => [created, ...prev])
    return created
  }, [])

  const updateWebsite = useCallback(async (id, websiteData) => {
    const updated = await websitesApi.update(id, websiteData)
    setWebsites(prev => prev.map(w => w.id === id ? updated : w))
    return updated
  }, [])

  const deleteWebsite = useCallback(async (id) => {
    await websitesApi.delete(id)
    setWebsites(prev => prev.filter(w => w.id !== id))
  }, [])

  const publishWebsite = useCallback(async (id) => {
    const published = await websitesApi.publish(id)
    setWebsites(prev => prev.map(w => w.id === id ? published : w))
    return published
  }, [])

  const unpublishWebsite = useCallback(async (id) => {
    const unpublished = await websitesApi.unpublish(id)
    setWebsites(prev => prev.map(w => w.id === id ? unpublished : w))
    return unpublished
  }, [])

  return {
    websites,
    loading,
    error,
    fetchWebsites,
    createWebsite,
    updateWebsite,
    deleteWebsite,
    publishWebsite,
    unpublishWebsite,
  }
}

export function useWebsite(id) {
  const [website, setWebsite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    websitesApi.getById(id)
      .then(data => { if (!cancelled) setWebsite(data) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const update = useCallback(async (data) => {
    const updated = await websitesApi.update(id, data)
    setWebsite(updated)
    return updated
  }, [id])

  return { website, loading, error, update }
}

export function usePublishedSite(slug) {
  const [site, setSite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    websitesApi.getBySlug(slug)
      .then(data => { if (!cancelled) setSite(data) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  return { site, loading, error }
}
