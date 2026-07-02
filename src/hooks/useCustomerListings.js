import { useState, useCallback } from 'react'
import { customerListingsApi } from '../api/customerListings'

// Bellek içi önbellek: { [musteriId]: { [ilanId]: { not } } }
let cache = {}

export function useCustomerListings() {
  const [version, setVersion] = useState(0)
  const [loadingFor, setLoadingFor] = useState(null)

  const loadForCustomer = useCallback(async (musteriId) => {
    if (!musteriId) return
    setLoadingFor(musteriId)
    try {
      const list = await customerListingsApi.getForCustomer(musteriId)
      cache = {
        ...cache,
        [musteriId]: Object.fromEntries(
          list.map(a => [a.ilanId, { not: a.not || '' }])
        ),
      }
      setVersion(v => v + 1)
    } finally {
      setLoadingFor(null)
    }
  }, [])

  const associate = useCallback(async (musteriId, ilanId) => {
    await customerListingsApi.associate(musteriId, ilanId)
    cache = {
      ...cache,
      [musteriId]: {
        ...(cache[musteriId] || {}),
        [ilanId]: { not: '' },
      },
    }
    setVersion(v => v + 1)
  }, [])

  const disassociate = useCallback(async (musteriId, ilanId) => {
    await customerListingsApi.disassociate(musteriId, ilanId)
    if (cache[musteriId]) {
      const rest = { ...cache[musteriId] }
      delete rest[ilanId]
      cache = Object.keys(rest).length === 0
        ? { ...cache, [musteriId]: {} }
        : { ...cache, [musteriId]: rest }
    }
    setVersion(v => v + 1)
  }, [])

  const updateNote = useCallback(async (musteriId, ilanId, not) => {
    await customerListingsApi.updateNote(musteriId, ilanId, not)
    if (cache[musteriId]) {
      cache = {
        ...cache,
        [musteriId]: {
          ...cache[musteriId],
          [ilanId]: { not },
        },
      }
    }
    setVersion(v => v + 1)
  }, [])

  const getCustomersForListing = useCallback((ilanId) => {
    const result = []
    for (const musteriId of Object.keys(cache)) {
      if (cache[musteriId][ilanId]) {
        result.push({ musteriId, not: cache[musteriId][ilanId].not })
      }
    }
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])

  const getListingsForCustomer = useCallback((musteriId) => {
    const data = cache[musteriId]
    if (!data) return []
    return Object.entries(data).map(([ilanId, val]) => ({ ilanId, not: val.not }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])

  const isAssociated = useCallback((musteriId, ilanId) => {
    return !!(cache[musteriId] && cache[musteriId][ilanId])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])

  return {
    loading: !!loadingFor,
    loadingFor,
    loadForCustomer,
    associate,
    disassociate,
    updateNote,
    getCustomersForListing,
    getListingsForCustomer,
    isAssociated,
  }
}
