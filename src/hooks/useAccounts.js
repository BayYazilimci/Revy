import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../api/admin'

/**
 * Admin hesap listesi — gerçek backend'den (/admin/accounts).
 * Eski localStorage mock'u (data/accounts.js) kaldırıldı.
 */
export function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setAccounts(await adminApi.getAccounts())
    } catch (err) {
      setError(err.message || 'Hesaplar yüklenemedi')
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const setStatus = useCallback(async (id, status, extra) => {
    // İyimser güncelleme
    setAccounts(prev => prev.map(a => (a.id === id
      ? { ...a, status, banReason: status === 'banli' ? (extra?.banReason || a.banReason) : undefined }
      : a)))
    try {
      await adminApi.setStatus(id, status, extra || {})
    } catch (err) {
      // Hata olursa listeyi backend'den tazele
      load()
      throw err
    }
  }, [load])

  return { accounts, setStatus, loading, error, refetch: load }
}
