export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon,
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-extrabold rounded-2xl transition-all duration-200 btn'

  const variants = {
    primary: 'text-deep shadow-lg',
    secondary: 'border-2 border-cardBorder text-deep',
    danger: 'text-white',
    ghost: 'bg-transparent hover:bg-cream text-deep',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2.5 text-xs',
    lg: 'px-6 py-3 text-sm',
  }

  const variantStyles = {
    primary: { background: '#e3d10d', boxShadow: '0 8px 24px rgba(227,209,13,.25)' },
    secondary: {},
    danger: { background: '#dc2626' },
    ghost: {},
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}
      style={variantStyles[variant]}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
