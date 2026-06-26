export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex-1 flex flex-col items-center justify-center text-center py-16 animate-fade ${className}`}>
      {Icon && (
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-5">
          <Icon size={32} className="text-gray-300" />
        </div>
      )}
      <h3 className="text-lg font-extrabold" style={{ color: '#1e1b2e' }}>{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 font-medium mt-1 max-w-xs">{description}</p>
      )}
      {action && (
        <div className="mt-5">{action}</div>
      )}
    </div>
  )
}
