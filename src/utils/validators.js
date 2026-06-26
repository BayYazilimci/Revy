export function validateListName(name) {
  const trimmed = (name || '').trim()
  if (trimmed.length < 2) return 'Liste adı en az 2 karakter olmalıdır'
  if (trimmed.length > 40) return 'Liste adı en fazla 40 karakter olabilir'
  return null
}

export function validateListDescription(desc) {
  const trimmed = (desc || '').trim()
  if (trimmed.length > 120) return 'Açıklama en fazla 120 karakter olabilir'
  return null
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function notEmpty(val) {
  return val !== null && val !== undefined && val !== ''
}
