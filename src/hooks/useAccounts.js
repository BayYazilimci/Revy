import { useState, useEffect, useCallback } from 'react'
import {
  getAccounts, setAccountStatus, syncCurrentUser, ACCOUNTS_EVENT,
} from '../data/accounts'

export function useAccounts() {
  const [accounts, setAccounts] = useState(() => {
    syncCurrentUser()
    return getAccounts()
  })

  useEffect(() => {
    const handler = () => setAccounts(getAccounts())
    window.addEventListener(ACCOUNTS_EVENT, handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener(ACCOUNTS_EVENT, handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const setStatus = useCallback((id, status, extra) => {
    setAccountStatus(id, status, extra)
  }, [])

  return { accounts, setStatus }
}
