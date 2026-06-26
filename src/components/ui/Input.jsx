import { forwardRef } from 'react'

const Input = forwardRef(function Input({
  label,
  error,
  className = '',
  textarea = false,
  ...props
}, ref) {
  const base = `w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold
    focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none
    transition-all duration-200 ${error ? 'border-red-300' : 'border-cardBorder'} ${className}`

  const style = { color: '#1e1b2e' }

  return (
    <div>
      {label && (
        <label className="text-xs font-bold text-gray-500 mb-1.5 block">{label}</label>
      )}
      {textarea ? (
        <textarea ref={ref} className={`${base} resize-none`} style={style} {...props} />
      ) : (
        <input ref={ref} className={base} style={style} {...props} />
      )}
      {error && (
        <p className="text-xs text-red-400 font-medium mt-1">{error}</p>
      )}
    </div>
  )
})

export default Input
