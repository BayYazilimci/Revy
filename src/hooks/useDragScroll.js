import { useRef, useCallback } from 'react'

export function useDragScroll() {
  const containerRef = useRef(null)
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    dragged: false,
    velocity: 0,
    momentumAnim: null,
    lastMoveTime: 0,
  })

  const stopMomentum = () => {
    if (dragState.current.momentumAnim) {
      cancelAnimationFrame(dragState.current.momentumAnim)
      dragState.current.momentumAnim = null
    }
  }

  const getOffsetX = (e) => {
    const container = containerRef.current
    if (!container) return 0
    const rect = container.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    return clientX - rect.left
  }

  const handleDragStart = useCallback((e) => {
    stopMomentum()
    const container = containerRef.current
    if (!container) return
    container.style.scrollBehavior = 'auto'
    dragState.current.isDragging = true
    dragState.current.startX = getOffsetX(e)
    dragState.current.scrollLeft = container.scrollLeft
    dragState.current.dragged = false
    dragState.current.velocity = 0
    dragState.current.lastMoveTime = performance.now()
    container.style.cursor = 'grabbing'
    container.style.userSelect = 'none'
    if (e.cancelable) e.preventDefault()
  }, [])

  const handleDragMove = useCallback((e) => {
    const container = containerRef.current
    if (!dragState.current.isDragging || !container) return
    if (e.cancelable) e.preventDefault()
    const x = getOffsetX(e)
    const walk = (x - dragState.current.startX) * 1.5
    if (Math.abs(walk) > 5) dragState.current.dragged = true
    const now = performance.now()
    const dt = now - dragState.current.lastMoveTime || 1
    dragState.current.velocity = (-walk * 16) / dt
    dragState.current.lastMoveTime = now
    container.scrollLeft = dragState.current.scrollLeft - walk
  }, [])

  const startMomentum = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    let vel = dragState.current.velocity
    const friction = 0.95
    const minVel = 0.5

    if (Math.abs(vel) < minVel) {
      container.style.scrollBehavior = 'smooth'
      return
    }

    const step = () => {
      vel *= friction
      container.scrollLeft -= vel
      if (Math.abs(vel) > minVel) {
        dragState.current.momentumAnim = requestAnimationFrame(step)
      } else {
        container.style.scrollBehavior = 'smooth'
      }
    }
    dragState.current.momentumAnim = requestAnimationFrame(step)
  }, [])

  const handleDragEnd = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    dragState.current.isDragging = false
    container.style.cursor = ''
    container.style.userSelect = ''
    if (dragState.current.dragged) {
      startMomentum()
    } else {
      container.style.scrollBehavior = 'smooth'
    }
  }, [startMomentum])

  const handleMouseDown = useCallback((e) => handleDragStart(e), [handleDragStart])
  const handleMouseMove = useCallback((e) => handleDragMove(e), [handleDragMove])
  const handleMouseUp = useCallback(() => handleDragEnd(), [handleDragEnd])
  const handleMouseLeave = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    if (!dragState.current.isDragging) return
    handleDragEnd()
  }, [handleDragEnd])

  const handleTouchStart = useCallback((e) => handleDragStart(e), [handleDragStart])
  const handleTouchMove = useCallback((e) => handleDragMove(e), [handleDragMove])
  const handleTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd])

  const wasDragged = useCallback(() => dragState.current.dragged, [])

  return { containerRef, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave, wasDragged, handleTouchStart, handleTouchMove, handleTouchEnd }
}
