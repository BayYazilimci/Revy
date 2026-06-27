import { useState, useEffect } from 'react'
import { adminApi } from '../api/admin'

/**
 * Admin gösterge paneli verileri (KPI, büyüme, haftalık, plan dağılımı,
 * aktivite, sistem sağlığı) — gerçek backend'den (/admin/overview).
 */
export function useAdminOverview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    adminApi.getOverview()
      .then(d => { if (alive) setData(d) })
      .catch(err => { if (alive) setError(err.message || 'Veriler yüklenemedi') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return { data, loading, error }
}
