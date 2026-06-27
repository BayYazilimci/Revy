/* ------------------------------------------------------------------ */
/*  JWT token deposu (localStorage)                                    */
/*  apiClient ve AuthContext buradan okur/yazar.                       */
/* ------------------------------------------------------------------ */

const ACCESS_KEY = 'revy_access_token'
const REFRESH_KEY = 'revy_refresh_token'

export const tokenStore = {
  getAccess() {
    return localStorage.getItem(ACCESS_KEY)
  },
  getRefresh() {
    return localStorage.getItem(REFRESH_KEY)
  },
  set({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
  },
  setAccess(accessToken) {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}
