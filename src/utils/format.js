export function formatPrice(price) {
  if (!price) return '₺0'
  const num = typeof price === 'string'
    ? parseFloat(price.replace(/[^0-9,.-]/g, '').replace(',', ''))
    : price
  if (isNaN(num)) return price
  return '₺' + num.toLocaleString('tr-TR')
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'az önce'
  if (diffMins < 60) return `${diffMins} dk önce`
  if (diffHours < 24) return `${diffHours} saat önce`
  if (diffDays < 7) return `${diffDays} gün önce`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`
  return date.toLocaleDateString('tr-TR')
}

export function formatRelativeTime(timeStr) {
  if (!timeStr) return ''
  return timeStr
}

export function truncate(str, maxLen = 60) {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : (plural || singular + 'ler')
}
