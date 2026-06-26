import { useState, useEffect, useCallback } from 'react'
import { appointmentsApi } from '../api/appointments'

export function useAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await appointmentsApi.getAll()
      // Sort appointments chronologically by date and time
      const sorted = result.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return a.time.localeCompare(b.time)
      })
      setAppointments(sorted)
    } catch (err) {
      setError(err.message || 'Randevular yüklenirken hata oluştu')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const create = useCallback(async (appData) => {
    const created = await appointmentsApi.create(appData)
    setAppointments(prev => {
      const updated = [...prev, created]
      return updated.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return a.time.localeCompare(b.time)
      })
    })
    return created
  }, [])

  const update = useCallback(async (id, appData) => {
    const updated = await appointmentsApi.update(id, appData)
    setAppointments(prev => {
      const updatedList = prev.map(a => a.id === id ? updated : a)
      return updatedList.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return a.time.localeCompare(b.time)
      })
    })
    return updated
  }, [])

  const remove = useCallback(async (id) => {
    await appointmentsApi.delete(id)
    setAppointments(prev => prev.filter(a => a.id !== id))
  }, [])

  /**
   * Checks if a proposed appointment conflicts/overlaps with existing active appointments.
   * Active means status is NOT 'iptal'.
   *
   * @param {string} date - Date in format YYYY-MM-DD
   * @param {string} time - Time in format HH:MM
   * @param {number|string} duration - Duration in minutes
   * @param {string} [excludeId] - ID of appointment to exclude (when editing)
   * @returns {Object|null} - The conflicting appointment object, or null if no conflict.
   */
  const checkConflict = useCallback((date, time, duration, excludeId = null) => {
    if (!date || !time || !duration) return null

    const dur = parseInt(duration, 10)
    if (isNaN(dur) || dur <= 0) return null

    // Parse proposed start time
    const [propHour, propMin] = time.split(':').map(Number)
    if (isNaN(propHour) || propHour === undefined) return null
    const propStart = propHour * 60 + propMin
    const propEnd = propStart + dur

    for (const app of appointments) {
      // Skip the appointment itself if editing, and skip canceled appointments
      if (app.id === excludeId || app.status === 'iptal') continue

      if (app.date === date) {
        const [appHour, appMin] = app.time.split(':').map(Number)
        const appStart = appHour * 60 + appMin
        const appEnd = appStart + app.duration

        // Check for overlap: max of starts is less than min of ends
        const overlap = Math.max(propStart, appStart) < Math.min(propEnd, appEnd)
        if (overlap) {
          return app // return the conflicting appointment
        }
      }
    }
    return null
  }, [appointments])

  return {
    appointments,
    loading,
    error,
    create,
    update,
    remove,
    checkConflict,
    refetch: fetch,
  }
}
