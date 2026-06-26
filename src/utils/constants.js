export const STATUS = {
  ACTIVE: 'Aktif',
  PASSIVE: 'Pasif',
  LIMITED: 'Sınırlı Süre',
}

export const STATUS_COLORS = {
  [STATUS.ACTIVE]: { bg: '#d1fae5', text: '#059669' },
  [STATUS.PASSIVE]: { bg: '#fde8e8', text: '#dc2626' },
  [STATUS.LIMITED]: { bg: '#dbeafe', text: '#2563eb' },
}

export const TOAST_DURATION = 3000
export const TOAST_TYPES = {
  DEFAULT: 'default',
  ERROR: 'error',
  WARNING: 'warning',
}
