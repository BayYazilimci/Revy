import { useState, useEffect, useCallback } from 'react'
import { customersApi } from '../api/customers'

export function useCustomers() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await customersApi.getAll()
      setData(result)
    } catch (err) {
      setError(err.message || 'Müşteriler yüklenirken hata oluştu')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const create = useCallback(async (customerData) => {
    const customer = await customersApi.create(customerData)
    setData(prev => [...prev, customer])
    return customer
  }, [])

  const update = useCallback(async (id, customerData) => {
    const updated = await customersApi.update(id, customerData)
    setData(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }, [])

  const remove = useCallback(async (id) => {
    await customersApi.delete(id)
    setData(prev => prev.filter(c => c.id !== id))
  }, [])

  const refetch = useCallback(() => {
    fetch()
  }, [fetch])

  return {
    customers: data,
    loading,
    error,
    create,
    update,
    remove,
    refetch,
  }
}
