import { useState, useEffect, useMemo, useContext } from 'react'
import { useAppointments } from '../hooks/useAppointments'
import { useCustomers } from '../hooks/useCustomers'
import { useApp } from '../context/AppContext'
import { TabContext } from '../App'
import { properties } from '../data/properties'
import { MY_LISTINGS_ID } from '../data/lists'
import { 
  Calendar as CalendarIcon, Clock, MapPin, FileText, Plus, X, 
  Trash2, Pencil, ChevronLeft, ChevronRight, AlertTriangle, 
  User, CheckCircle, Info, RefreshCw, CalendarDays, Home
} from 'lucide-react'

// Month names in Turkish
const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

// Day names starting from Monday
const DAYS_OF_WEEK = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

const DURATION_OPTIONS = [
  { value: 15, label: '15 Dakika' },
  { value: 30, label: '30 Dakika' },
  { value: 45, label: '45 Dakika' },
  { value: 60, label: '1 Saat' },
  { value: 90, label: '1.5 Saat' },
  { value: 120, label: '2 Saat' },
  { value: 180, label: '3 Saat' }
]

const STATUS_OPTIONS = [
  { value: 'onaylandı', label: 'Onaylandı', color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  { value: 'bekliyor', label: 'Bekliyor', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  { value: 'iptal', label: 'İptal Edildi', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' }
]

// Format helper to YYYY-MM-DD
const formatDateStr = (dateObj) => {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function Appointments() {
  const { addToast, lists } = useApp()
  const { appointments, loading, create, update, remove, checkConflict } = useAppointments()
  const { customers, loading: loadingCust } = useCustomers()
  const { tabParams, setTabParams } = useContext(TabContext)

  const myListingIds = lists[MY_LISTINGS_ID]?.items || []
  const availableListings = myListingIds.map(id => properties[id]).filter(Boolean)

  // Navigation state
  const [viewMode, setViewMode] = useState('month') // 'month' or 'week'
  const [navDate, setNavDate] = useState(new Date()) // Year/Month being navigated
  const [selectedDateStr, setSelectedDateStr] = useState(() => formatDateStr(new Date()))

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit' or 'view'
  const [selectedApp, setSelectedApp] = useState(null)

  // Form state
  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '10:00',
    duration: 60,
    attendeeId: '',
    attendeeName: '',
    useCustomAttendee: false,
    location: '',
    description: '',
    status: 'onaylandı',
    listingId: '',
    listingTitle: ''
  })

  const [fieldErrors, setFieldErrors] = useState({})

  // Sync date input in form when selectedDateStr changes
  useEffect(() => {
    if (modalMode === 'create') {
      setForm(prev => ({ ...prev, date: selectedDateStr }))
    }
  }, [selectedDateStr, modalMode])

  // Handle quick appointment creation from customers page
  useEffect(() => {
    if (tabParams?.quickAddCustomerId && !loadingCust && customers.length > 0) {
      const custId = tabParams.quickAddCustomerId
      const cust = customers.find(c => c.id === custId)
      if (cust) {
        setForm({
          title: `${cust.ad} ${cust.soyad} ile Görüşme`,
          date: formatDateStr(new Date()), // today
          time: '10:00',
          duration: 60,
          attendeeId: custId,
          attendeeName: `${cust.ad} ${cust.soyad}`,
          useCustomAttendee: false,
          location: '',
          description: '',
          status: 'onaylandı'
        })
        setFieldErrors({})
        setSelectedApp(null)
        setModalMode('create')
        setShowModal(true)
        setSelectedDateStr(formatDateStr(new Date()))

        // Clear the parameters from context so it doesn't reopen
        setTabParams({})
      }
    }
  }, [tabParams, customers, loadingCust, setTabParams])

  // Get active appointments mapped by date
  const appointmentsByDate = useMemo(() => {
    const map = {}
    appointments.forEach(app => {
      if (!map[app.date]) {
        map[app.date] = []
      }
      map[app.date].push(app)
    })
    return map
  }, [appointments])

  // Real-time conflict checking based on form changes
  const activeConflict = useMemo(() => {
    if (!form.date || !form.time || !form.duration) return null
    // Skip checking if status is canceled
    if (form.status === 'iptal') return null
    return checkConflict(form.date, form.time, form.duration, selectedApp?.id)
  }, [form.date, form.time, form.duration, form.status, selectedApp, checkConflict])

  // Reset form helper
  const resetForm = () => {
    setForm({
      title: '',
      date: selectedDateStr,
      time: '10:00',
      duration: 60,
      attendeeId: '',
      attendeeName: '',
      useCustomAttendee: false,
      location: '',
      description: '',
      status: 'onaylandı',
      listingId: '',
      listingTitle: ''
    })
    setFieldErrors({})
    setSelectedApp(null)
  }

  // Handle month/week navigation
  const handlePrev = () => {
    setNavDate(prev => {
      const d = new Date(prev)
      if (viewMode === 'month') {
        d.setMonth(prev.getMonth() - 1)
      } else {
        d.setDate(prev.getDate() - 7)
      }
      return d
    })
  }

  const handleNext = () => {
    setNavDate(prev => {
      const d = new Date(prev)
      if (viewMode === 'month') {
        d.setMonth(prev.getMonth() + 1)
      } else {
        d.setDate(prev.getDate() + 7)
      }
      return d
    })
  }

  const handleToday = () => {
    const today = new Date()
    setNavDate(today)
    setSelectedDateStr(formatDateStr(today))
  }

  // Generate calendar grid for MONTH view
  const monthDays = useMemo(() => {
    const year = navDate.getFullYear()
    const month = navDate.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Day of the week of first day (Monday=0, ..., Sunday=6)
    const startDayOfWeek = (firstDay.getDay() + 6) % 7
    // Total days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    // Total days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const grid = []

    // 1. Previous month trailing days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i)
      grid.push({
        date: d,
        dateStr: formatDateStr(d),
        isCurrentMonth: false,
        dayNum: d.getDate()
      })
    }

    // 2. Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i)
      grid.push({
        date: d,
        dateStr: formatDateStr(d),
        isCurrentMonth: true,
        dayNum: i
      })
    }

    // 3. Next month leading days (fill up to 42 cells)
    const remainingCells = 42 - grid.length
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i)
      grid.push({
        date: d,
        dateStr: formatDateStr(d),
        isCurrentMonth: false,
        dayNum: i
      })
    }

    return grid
  }, [navDate])

  // Generate calendar columns for WEEK view
  const weekDays = useMemo(() => {
    // Find the Monday of the navDate week
    const current = new Date(navDate)
    const dayOfWeek = (current.getDay() + 6) % 7 // Monday=0, ..., Sunday=6
    const monday = new Date(current)
    monday.setDate(current.getDate() - dayOfWeek)

    const list = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      list.push({
        date: d,
        dateStr: formatDateStr(d),
        dayName: DAYS_OF_WEEK[i],
        dayNum: d.getDate()
      })
    }
    return list
  }, [navDate])

  // Form validation
  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Konu/Başlık gerekli'
    if (!form.date) errs.date = 'Tarih gerekli'
    if (!form.time) errs.time = 'Saat gerekli'
    
    if (form.useCustomAttendee) {
      if (!form.attendeeName.trim()) errs.attendeeName = 'Katılımcı ismi gerekli'
    } else {
      if (!form.attendeeId) errs.attendeeId = 'Katılımcı seçimi gerekli'
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Handle create/edit submit
  const handleSubmit = async () => {
    if (!validate()) return

    // Find attendee name from dropdown if not custom
    let finalAttendeeName = form.attendeeName
    if (!form.useCustomAttendee && form.attendeeId) {
      const selectedCust = customers.find(c => c.id === form.attendeeId)
      if (selectedCust) {
        finalAttendeeName = `${selectedCust.ad} ${selectedCust.soyad}`
      }
    }

    const payload = {
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      duration: parseInt(form.duration, 10),
      attendeeId: form.useCustomAttendee ? '' : form.attendeeId,
      attendeeName: finalAttendeeName.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      status: form.status,
      listingId: form.listingId || '',
      listingTitle: form.listingTitle || ''
    }

    try {
      if (modalMode === 'create') {
        const created = await create(payload)
        addToast(`"${created.title}" randevusu oluşturuldu`)
      } else {
        await update(selectedApp.id, payload)
        addToast('Randevu güncellendi')
      }
      setShowModal(false)
      resetForm()
    } catch (err) {
      addToast('İşlem sırasında bir hata oluştu', 'warning')
    }
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Bu randevuyu silmek istediğinize emin misiniz?')) {
      try {
        await remove(id)
        addToast('Randevu silindi', 'warning')
        setShowModal(false)
        resetForm()
      } catch {
        addToast('Randevu silinirken hata oluştu', 'warning')
      }
    }
  }

  // Open Edit Mode
  const handleEditOpen = (app) => {
    setSelectedApp(app)
    setModalMode('edit')
    setForm({
      title: app.title,
      date: app.date,
      time: app.time,
      duration: app.duration,
      attendeeId: app.attendeeId || '',
      attendeeName: app.attendeeName || '',
      useCustomAttendee: !app.attendeeId,
      location: app.location || '',
      description: app.description || '',
      status: app.status,
      listingId: app.listingId || '',
      listingTitle: app.listingTitle || ''
    })
    setFieldErrors({})
    setShowModal(true)
  }

  // Open View Mode
  const handleViewOpen = (app) => {
    setSelectedApp(app)
    setModalMode('view')
    setShowModal(true)
  }

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('text/plain', appId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetDateStr) => {
    e.preventDefault()
    const appId = e.dataTransfer.getData('text/plain')
    if (!appId) return

    const appToUpdate = appointments.find(a => a.id === appId)
    if (!appToUpdate) return

    // If dropped on same date, do nothing
    if (appToUpdate.date === targetDateStr) return

    // Conflict check
    const conflict = checkConflict(targetDateStr, appToUpdate.time, appToUpdate.duration, appId)
    if (conflict) {
      const confirmMove = window.confirm(
        `⏱️ Dikkat: Sürüklediğiniz tarihte (${targetDateStr}) başka bir randevunuzla çakışma var:\n` +
        `"${conflict.title}" (${conflict.time} - ${getEndTime(conflict.time, conflict.duration)})\n\n` +
        `Yine de bu tarihe taşımak istiyor musunuz?`
      )
      if (!confirmMove) return
    }

    try {
      await update(appId, { date: targetDateStr })
      addToast(`Randevu tarihi ${targetDateStr} olarak güncellendi`)
    } catch (err) {
      addToast('Randevu taşınırken bir hata oluştu', 'warning')
    }
  }

  // Get current selected day's appointments sorted by time
  const selectedDayAppointments = useMemo(() => {
    const list = appointmentsByDate[selectedDateStr] || []
    return [...list].sort((a, b) => a.time.localeCompare(b.time))
  }, [appointmentsByDate, selectedDateStr])

  // Get formatted end time based on start time and duration
  const getEndTime = (startTimeStr, durationMin) => {
    if (!startTimeStr) return ''
    const [h, m] = startTimeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(h, m, 0, 0)
    const end = new Date(date.getTime() + durationMin * 60000)
    return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-cream">
      {/* Upper Navigation Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-5 border-b border-cardBorder bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md bg-accent/20">
              <CalendarIcon size={20} className="text-deep font-bold" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-deep">Randevu Takvimi</h1>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">
                Müşteri buluşmalarını ve takvimi yönetin
              </p>
            </div>
          </div>

          {/* Calendar Navigation and View Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-cream p-1 rounded-xl flex gap-1 border border-cardBorder">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'month' ? 'bg-white text-deep shadow-sm' : 'text-gray-400 hover:text-deep'
                }`}
              >
                Aylık Takvim
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'week' ? 'bg-white text-deep shadow-sm' : 'text-gray-400 hover:text-deep'
                }`}
              >
                Haftalık Görünüm
              </button>
            </div>

            {/* Nav Arrows */}
            <div className="flex items-center gap-1.5 bg-cream px-2 py-1 rounded-xl border border-cardBorder">
              <button
                onClick={handlePrev}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-deep transition-all"
                title={viewMode === 'month' ? 'Önceki Ay' : 'Önceki Hafta'}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-extrabold text-deep px-1.5 min-w-[100px] text-center">
                {viewMode === 'month' 
                  ? `${MONTHS[navDate.getMonth()]} ${navDate.getFullYear()}`
                  : `${navDate.getDate()} ${MONTHS[navDate.getMonth()]}`
                }
              </span>
              <button
                onClick={handleNext}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-deep transition-all"
                title={viewMode === 'month' ? 'Sonraki Ay' : 'Sonraki Hafta'}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Today and Add buttons */}
            <button
              onClick={handleToday}
              className="px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-white border border-cardBorder hover:bg-cream transition-all text-deep shadow-sm"
            >
              Bugün
            </button>

            <button
              onClick={() => { resetForm(); setModalMode('create'); setShowModal(true) }}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:brightness-105 transition-all bg-accent text-deep"
            >
              <Plus size={14} strokeWidth={3} />
              Yeni Randevu
            </button>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Left Column: Calendar (Width: 2 cols on large screen) */}
        <div className="lg:col-span-2 flex flex-col p-4 sm:p-6 min-h-0 overflow-y-auto">
          {viewMode === 'month' ? (
            /* MONTHLY CALENDAR GRID */
            <div className="bg-white rounded-2xl border border-cardBorder p-4 shadow-sm flex flex-col flex-1">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="text-xs font-extrabold text-gray-400 py-1">{day}</div>
                ))}
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-[300px]">
                {monthDays.map(({ date, dateStr, isCurrentMonth, dayNum }) => {
                  const dayApps = appointmentsByDate[dateStr] || []
                  const isSelected = dateStr === selectedDateStr
                  const isToday = formatDateStr(new Date()) === dateStr

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDateStr(dateStr)}
                      onDoubleClick={() => {
                        setSelectedDateStr(dateStr)
                        resetForm()
                        setModalMode('create')
                        setShowModal(true)
                      }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, dateStr)}
                      className={`min-h-[60px] sm:min-h-[80px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer select-none ${
                        isSelected 
                          ? 'border-accent bg-accent/5 ring-1 ring-accent' 
                          : 'border-cardBorder bg-white hover:border-gray-300'
                      } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${
                          isToday 
                            ? 'w-5 h-5 rounded-full bg-deep text-white flex items-center justify-center font-extrabold text-[10px]'
                            : isSelected ? 'text-accent font-extrabold' : 'text-gray-500'
                        }`}>
                          {dayNum}
                        </span>
                        {dayApps.length > 0 && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cream border border-cardBorder text-deep">
                            {dayApps.length}
                          </span>
                        )}
                      </div>

                      {/* Display first 1-2 appointments as pills */}
                      <div className="mt-1 space-y-1 overflow-hidden">
                        {dayApps.slice(0, 2).map(app => {
                          const statusOpt = STATUS_OPTIONS.find(o => o.value === app.status)
                          return (
                            <div 
                              key={app.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, app.id)}
                              className="text-[9px] font-semibold truncate rounded px-1 py-0.5 border cursor-grab active:cursor-grabbing"
                              style={{ 
                                backgroundColor: statusOpt?.bg || 'rgba(0,0,0,0.05)',
                                color: statusOpt?.color || '#000',
                                borderColor: statusOpt?.bg || 'transparent'
                              }}
                              title={`${app.time} - ${app.title}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewOpen(app)
                              }}
                            >
                              <span className="font-extrabold mr-0.5">{app.time}</span>
                              {app.attendeeName}
                            </div>
                          )
                        })}
                        {dayApps.length > 2 && (
                          <div className="text-[8px] text-gray-400 font-bold text-center">
                            +{dayApps.length - 2} daha
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* WEEKLY TIMELINE VIEW */
            <div className="flex-1 flex gap-3 overflow-x-auto pb-4 scrollbar-thin min-h-[400px]">
              {weekDays.map(({ date, dateStr, dayName, dayNum }) => {
                const dayApps = (appointmentsByDate[dateStr] || []).sort((a, b) => a.time.localeCompare(b.time))
                const isSelected = dateStr === selectedDateStr
                const isToday = formatDateStr(new Date()) === dateStr

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDateStr(dateStr)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dateStr)}
                    className={`flex-shrink-0 w-64 flex flex-col bg-white rounded-2xl border p-3.5 shadow-sm transition-all cursor-pointer ${
                      isSelected ? 'border-accent ring-2 ring-accent/15' : 'border-cardBorder'
                    }`}
                  >
                    {/* Header of Column */}
                    <div className="flex items-center justify-between pb-2 border-b border-cardBorder mb-3">
                      <div>
                        <h3 className="text-sm font-extrabold text-deep">{dayName}</h3>
                        <p className="text-[10px] font-semibold text-gray-400">{date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</p>
                      </div>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        isToday ? 'bg-deep text-white' : 'bg-cream text-gray-400'
                      }`}>
                        {dayNum}
                      </span>
                    </div>

                    {/* Column appointments */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                      {dayApps.length === 0 ? (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDateStr(dateStr)
                            resetForm()
                            setModalMode('create')
                            setShowModal(true)
                          }}
                          className="h-28 border-2 border-dashed border-cardBorder rounded-xl flex flex-col items-center justify-center hover:bg-cream hover:border-gray-300 transition-all text-center p-3"
                        >
                          <Plus size={16} className="text-gray-300 mb-1" />
                          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Randevu Ekle</span>
                        </div>
                      ) : (
                        dayApps.map(app => {
                          const statusOpt = STATUS_OPTIONS.find(o => o.value === app.status)
                          return (
                            <div
                              key={app.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, app.id)}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedDateStr(dateStr)
                                handleViewOpen(app)
                              }}
                              className="p-2.5 rounded-xl border border-cardBorder bg-white hover:shadow-sm hover:border-gray-300 transition-all cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-[10px] font-extrabold text-deep flex items-center gap-1">
                                  <Clock size={10} className="text-gray-400" />
                                  {app.time}
                                </span>
                                <span 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: statusOpt?.color }}
                                  title={statusOpt?.label}
                                />
                              </div>
                              <h4 className="text-xs font-extrabold text-deep truncate">{app.title}</h4>
                              <p className="text-[10px] font-semibold text-gray-400 truncate mt-0.5 flex items-center gap-1">
                                <User size={10} className="text-gray-300" />
                                {app.attendeeName}
                              </p>
                              {app.location && (
                                <p className="text-[9px] font-semibold text-gray-400 truncate mt-1 flex items-center gap-0.5">
                                  <MapPin size={9} className="text-gray-300" />
                                  {app.location}
                                </p>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Day Timeline Detail (Timeline) */}
        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-cardBorder bg-white flex flex-col min-h-0">
          <div className="p-4 border-b border-cardBorder bg-white shrink-0">
            <h2 className="text-sm font-extrabold text-deep">
              {new Date(selectedDateStr).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Günlük Program</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : selectedDayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 px-6">
                <div className="w-14 h-14 rounded-2xl bg-cream flex items-center justify-center mb-4">
                  <CalendarDays size={24} className="text-gray-300" />
                </div>
                <h3 className="text-sm font-extrabold text-deep">Randevu Yok</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Bu tarihte henüz bir randevu planlanmadı.
                </p>
                <button
                  onClick={() => { resetForm(); setModalMode('create'); setShowModal(true) }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-extrabold bg-accent text-deep shadow-sm"
                >
                  Randevu Oluştur
                </button>
              </div>
            ) : (
              <div className="relative border-l-2 border-cardBorder ml-3 pl-5 space-y-5 py-2">
                {selectedDayAppointments.map((app) => {
                  const statusOpt = STATUS_OPTIONS.find(o => o.value === app.status)
                  const endTime = getEndTime(app.time, app.duration)

                  return (
                    <div key={app.id} className="relative group">
                      {/* Timeline Dot Indicator */}
                      <span 
                        className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-2 border-white ring-2 transition-all group-hover:scale-110"
                        style={{ 
                          backgroundColor: statusOpt?.color,
                          ringColor: statusOpt?.color + '20' 
                        }}
                      />

                      {/* Card Content */}
                      <div className="bg-cream/40 border border-cardBorder rounded-2xl p-4 shadow-sm hover:border-gray-300 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span 
                              className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider inline-block mb-1.5"
                              style={{ 
                                color: statusOpt?.color,
                                backgroundColor: statusOpt?.bg 
                              }}
                            >
                              {statusOpt?.label}
                            </span>
                            <h3 className="text-sm font-extrabold text-deep leading-snug">{app.title}</h3>
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditOpen(app)}
                              className="w-7 h-7 rounded-lg hover:bg-white border border-transparent hover:border-cardBorder flex items-center justify-center btn text-gray-400 hover:text-deep shadow-sm"
                              title="Düzenle"
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="w-7 h-7 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 flex items-center justify-center btn text-gray-400 hover:text-red-500 shadow-sm"
                              title="Sil"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-2 mt-3.5 border-t border-cardBorder pt-3">
                          <div className="flex items-center gap-2 text-xs text-deep font-semibold">
                            <Clock size={12} className="text-gray-400" />
                            <span>{app.time} - {endTime}</span>
                            <span className="text-[10px] text-gray-400">({app.duration} dk)</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-deep font-semibold">
                            <User size={12} className="text-gray-400" />
                            <span className="truncate">{app.attendeeName}</span>
                          </div>

                          {app.listingTitle && (
                            <div className="flex items-center gap-2 text-xs text-deep font-semibold">
                              <Home size={12} className="text-gray-400 shrink-0" />
                              <span className="truncate text-gray-600">İlan: {app.listingTitle}</span>
                            </div>
                          )}

                          {app.location && (
                            <div className="flex items-start gap-2 text-xs text-deep font-medium">
                              <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" />
                              <span className="text-gray-600 leading-normal">{app.location}</span>
                            </div>
                          )}

                          {app.description && (
                            <div className="flex items-start gap-2 text-xs text-gray-400 font-medium">
                              <FileText size={12} className="text-gray-300 mt-0.5 shrink-0" />
                              <span className="leading-relaxed line-clamp-3">{app.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== ADD / EDIT / VIEW MODAL ===== */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-modal-fade"
          onClick={() => { setShowModal(false); resetForm() }}
        >
          <div 
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-scale-in max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5 border-b border-cardBorder pb-3">
              <h3 className="text-lg font-extrabold text-deep">
                {modalMode === 'create' && 'Yeni Randevu Oluştur'}
                {modalMode === 'edit' && 'Randevuyu Düzenle'}
                {modalMode === 'view' && 'Randevu Detayları'}
              </h3>
              <button 
                className="modal-close w-8 h-8 rounded-full bg-cream flex items-center justify-center" 
                onClick={() => { setShowModal(false); resetForm() }}
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* REAL-TIME COLLISION ALERT */}
            {modalMode !== 'view' && activeConflict && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3 animate-fade-in">
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-red-700">⏱️ Randevu Çakışması Algılandı!</h4>
                  <p className="text-[11px] font-semibold text-red-600 mt-0.5 leading-normal">
                    Bu saat aralığında zaten başka bir randevunuz bulunuyor:
                  </p>
                  <p className="text-[11px] font-black text-red-700 mt-1">
                    "{activeConflict.title}" ({activeConflict.time} - {getEndTime(activeConflict.time, activeConflict.duration)})
                  </p>
                  <p className="text-[10px] text-red-500 font-medium mt-1">
                    Kaydetmek mümkündür fakat saat çakışmasına dikkat ediniz.
                  </p>
                </div>
              </div>
            )}

            {modalMode === 'view' ? (
              /* VIEW MODE DETAILS */
              <div className="space-y-4 text-deep">
                <div className="bg-cream/50 rounded-2xl p-4 border border-cardBorder">
                  <span 
                    className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider inline-block mb-2"
                    style={{ 
                      color: STATUS_OPTIONS.find(o => o.value === selectedApp?.status)?.color,
                      backgroundColor: STATUS_OPTIONS.find(o => o.value === selectedApp?.status)?.bg
                    }}
                  >
                    {STATUS_OPTIONS.find(o => o.value === selectedApp?.status)?.label}
                  </span>
                  <h4 className="text-base font-extrabold leading-tight">{selectedApp?.title}</h4>
                </div>

                <div className="space-y-3.5 px-1.5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Tarih</p>
                      <p className="text-xs font-bold text-deep mt-0.5">
                        {new Date(selectedApp?.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Saat & Süre</p>
                      <p className="text-xs font-bold text-deep mt-0.5">
                        {selectedApp?.time} - {getEndTime(selectedApp?.time, selectedApp?.duration)} 
                        <span className="text-[10px] text-gray-400 font-semibold ml-1">({selectedApp?.duration} dk)</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Katılımcı / Müşteri</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <User size={13} className="text-deep font-bold" />
                      </div>
                      <span className="text-xs font-extrabold text-deep">{selectedApp?.attendeeName}</span>
                    </div>
                  </div>

                  {selectedApp?.listingTitle && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">İlişkili İlan</p>
                      <p className="text-xs font-semibold text-deep mt-0.5 flex items-start gap-1">
                        <Home size={13} className="text-gray-400 shrink-0 mt-0.5" />
                        <span>{selectedApp?.listingTitle}</span>
                      </p>
                    </div>
                  )}

                  {selectedApp?.location && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Konum</p>
                      <p className="text-xs font-semibold text-deep mt-0.5 flex items-start gap-1">
                        <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                        <span>{selectedApp?.location}</span>
                      </p>
                    </div>
                  )}

                  {selectedApp?.description && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Açıklama</p>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed mt-1 whitespace-pre-line bg-cream/30 p-3 rounded-xl border border-cardBorder">
                        {selectedApp?.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5 pt-4 border-t border-cardBorder">
                  <button 
                    className="flex-1 py-3 rounded-2xl text-xs font-extrabold border border-cardBorder hover:bg-cream transition-all btn text-deep" 
                    onClick={() => { setShowModal(false); resetForm() }}
                  >
                    Kapat
                  </button>
                  <button 
                    className="py-3 px-5 rounded-2xl text-xs font-extrabold border border-red-200 hover:bg-red-50 text-red-500 transition-all btn shrink-0" 
                    onClick={() => handleDelete(selectedApp?.id)}
                  >
                    Sil
                  </button>
                  <button 
                    className="flex-1 py-3 rounded-2xl text-xs font-extrabold shadow-md hover:brightness-105 transition-all bg-accent text-deep" 
                    onClick={() => handleEditOpen(selectedApp)}
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            ) : (
              /* CREATE / EDIT FORM MODE */
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Konu / Başlık *</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(227,209,13,.1)] outline-none transition-all duration-200 ${
                      fieldErrors.title ? 'border-red-300' : 'border-cardBorder'
                    }`}
                    style={{ color: '#1e1b2e' }}
                    placeholder="Örn: Portföy sunumu, Sözleşme imzalama"
                    value={form.title}
                    autoFocus
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                  {fieldErrors.title && <p className="text-xs text-red-400 font-semibold mt-1">{fieldErrors.title}</p>}
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1.5">
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Tarih *</label>
                    <input
                      type="date"
                      className="w-full px-3 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent outline-none"
                      style={{ color: '#1e1b2e' }}
                      value={form.date}
                      onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Başlangıç *</label>
                    <input
                      type="time"
                      className="w-full px-3 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent outline-none"
                      style={{ color: '#1e1b2e' }}
                      value={form.time}
                      onChange={e => setForm(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Süre *</label>
                    <select
                      className="w-full px-3 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent outline-none"
                      style={{ color: '#1e1b2e' }}
                      value={form.duration}
                      onChange={e => setForm(prev => ({ ...prev, duration: parseInt(e.target.value, 10) }))}
                    >
                      {DURATION_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Attendee Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-500">Katılımcı / Müşteri *</label>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ 
                        ...prev, 
                        useCustomAttendee: !prev.useCustomAttendee,
                        attendeeId: '',
                        attendeeName: ''
                      }))}
                      className="text-[10px] font-black text-accent hover:underline bg-transparent"
                    >
                      {form.useCustomAttendee ? 'Müşterilerimden Seç' : 'Manuel İsim Gir'}
                    </button>
                  </div>

                  {form.useCustomAttendee ? (
                    <input
                      type="text"
                      className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent outline-none ${
                        fieldErrors.attendeeName ? 'border-red-300' : 'border-cardBorder'
                      }`}
                      style={{ color: '#1e1b2e' }}
                      placeholder="Katılımcı Adı Soyadı"
                      value={form.attendeeName}
                      onChange={e => setForm(prev => ({ ...prev, attendeeName: e.target.value }))}
                    />
                  ) : (
                    <select
                      className={`w-full px-4 py-3 rounded-2xl border-2 bg-cream text-sm font-semibold focus:border-accent outline-none ${
                        fieldErrors.attendeeId ? 'border-red-300' : 'border-cardBorder'
                      }`}
                      style={{ color: '#1e1b2e' }}
                      value={form.attendeeId}
                      onChange={e => setForm(prev => ({ ...prev, attendeeId: e.target.value }))}
                    >
                      <option value="">-- Müşteri Seçin --</option>
                      {loadingCust ? (
                        <option disabled>Yükleniyor...</option>
                      ) : (
                        customers.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.ad} {c.soyad} {c.sirket ? `(${c.sirket})` : ''}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                  {fieldErrors.attendeeName && <p className="text-xs text-red-400 font-semibold mt-1">{fieldErrors.attendeeName}</p>}
                  {fieldErrors.attendeeId && <p className="text-xs text-red-400 font-semibold mt-1">{fieldErrors.attendeeId}</p>}
                </div>

                {/* Associated Listing Selector */}
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">İlişkili İlan (Opsiyonel)</label>
                  <select
                    className="w-full px-4 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent outline-none"
                    style={{ color: '#1e1b2e' }}
                    value={form.listingId}
                    onChange={e => {
                      const id = e.target.value
                      const prop = properties[id]
                      setForm(prev => ({ 
                        ...prev, 
                        listingId: id,
                        listingTitle: prop ? prop.title : ''
                      }))
                    }}
                  >
                    <option value="">-- İlan Seçin --</option>
                    {availableListings.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.title} - {l.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-500">Konum</label>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, location: 'Ofisim' }))}
                      className="text-[10px] font-black text-accent hover:underline bg-transparent"
                    >
                      Konumu "Ofisim" Yap
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent outline-none"
                      style={{ color: '#1e1b2e' }}
                      placeholder="Görüşme konumu veya adresi"
                      value={form.location}
                      onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Status & Details Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Durum *</label>
                    <select
                      className="w-full px-3 py-3 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent outline-none"
                      style={{ color: '#1e1b2e' }}
                      value={form.status}
                      onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Açıklama / Notlar</label>
                    <textarea
                      className="w-full px-4 py-2.5 rounded-2xl border-2 border-cardBorder bg-cream text-sm font-semibold focus:border-accent outline-none resize-none"
                      style={{ color: '#1e1b2e' }}
                      placeholder="Görüşme notları veya detayları..."
                      rows={2}
                      value={form.description}
                      onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-2.5 pt-2 border-t border-cardBorder">
                  <button 
                    type="button"
                    className="flex-1 py-3 rounded-2xl text-xs font-extrabold border-2 border-cardBorder hover:bg-cream transition-all btn text-deep" 
                    onClick={() => { setShowModal(false); resetForm() }}
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-3 rounded-2xl text-xs font-extrabold shadow-lg hover:brightness-105 transition-all bg-accent text-deep"
                    onClick={handleSubmit}
                  >
                    {modalMode === 'create' ? 'Oluştur' : 'Kaydet'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
