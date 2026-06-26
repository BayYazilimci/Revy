import { useState, useEffect, useCallback } from 'react'
import { customerListingsApi } from '../api/customerListings'

export function useCustomerListings() {
  const [associations, setAssociations] = useState({})
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await customerListingsApi.getAll()
      setAssociations(data)
    } catch {
      setAssociations({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const associate = useCallback(async (musteriId, ilanId) => {
    await customerListingsApi.associate(musteriId, ilanId)
    setAssociations(prev => {
      const next = { ...prev }
      if (!next[musteriId]) next[musteriId] = {}
      next[musteriId] = { ...next[musteriId], [ilanId]: { not: '' } }
      return next
    })
  }, [])

  const disassociate = useCallback(async (musteriId, ilanId) => {
    await customerListingsApi.disassociate(musteriId, ilanId)
    setAssociations(prev => {
      const next = { ...prev }
      if (next[musteriId]) {
        const rest = { ...next[musteriId] }
        delete rest[ilanId]
        if (Object.keys(rest).length === 0) {
          delete next[musteriId]
        } else {
          next[musteriId] = rest
        }
      }
      return next
    })
  }, [])

  const updateNote = useCallback(async (musteriId, ilanId, not) => {
    await customerListingsApi.updateNote(musteriId, ilanId, not)
    setAssociations(prev => {
      if (!prev[musteriId]) return prev
      return {
        ...prev,
        [musteriId]: {
          ...prev[musteriId],
          [ilanId]: { not }
        }
      }
    })
  }, [])

  const getCustomersForListing = useCallback((ilanId) => {
    const result = []
    for (const musteriId of Object.keys(associations)) {
      if (associations[musteriId][ilanId]) {
        result.push({
          musteriId,
          not: associations[musteriId][ilanId].not,
        })
      }
    }
    return result
  }, [associations])

  const getListingsForCustomer = useCallback((musteriId) => {
    const data = associations[musteriId]
    if (!data) return []
    return Object.entries(data).map(([ilanId, val]) => ({
      ilanId,
      not: val.not,
    }))
  }, [associations])

  const isAssociated = useCallback((musteriId, ilanId) => {
    return !!(associations[musteriId] && associations[musteriId][ilanId])
  }, [associations])

  return {
    associations,
    loading,
    associate,
    disassociate,
    updateNote,
    getCustomersForListing,
    getListingsForCustomer,
    isAssociated,
    refetch: fetch,
  }
}
