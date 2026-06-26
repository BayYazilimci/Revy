import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-modal-fade"
      onClick={onClose}
    >
      <div
        className={`relative bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} mx-4 p-6 animate-scale-in`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-extrabold" style={{ color: '#1e1b2e' }}>{title}</h3>
            {showClose && (
              <button
                className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center"
                onClick={onClose}
              >
                <X size={16} className="text-gray-500" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
