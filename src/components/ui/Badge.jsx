export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) {
  const variants = {
    default: { bg: '#f0ece6', color: '#1e1b2e' },
    accent: { bg: 'rgba(227,209,13,.2)', color: '#1e1b2e' },
    success: { bg: '#d1fae5', color: '#059669' },
    danger: { bg: '#fde8e8', color: '#dc2626' },
    info: { bg: '#dbeafe', color: '#2563eb' },
    warning: { bg: '#fef3c7', color: '#d97706' },
    white: { bg: 'rgba(255,255,255,.9)', color: '#1e1b2e' },
  }

  const sizes = {
    xs: 'text-[8px] px-1.5 py-0.5',
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }

  const v = variants[variant] || variants.default

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-lg ${sizes[size]} ${className}`}
      style={{ background: v.bg, color: v.color }}
    >
      {children}
    </span>
  )
}
