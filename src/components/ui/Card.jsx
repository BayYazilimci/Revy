export default function Card({
  children,
  className = '',
  hover = true,
  padding = true,
  onClick,
  style,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-cardBorder overflow-hidden shadow-sm ${
        hover ? 'listing-card' : ''
      } ${padding ? 'p-4' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
