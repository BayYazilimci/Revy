import { supabase } from './supabase'

function toClient(a) {
  if (!a) return null
  return {
    id: a.id,
    ownerId: a.owner_id,
    title: a.title,
    date: a.date,
    time: a.time,
    duration: a.duration,
    attendeeId: a.attendee_id,
    attendeeName: a.attendee_name,
    listingId: a.listing_id,
    listingTitle: a.listing_title,
    location: a.location,
    description: a.description,
    status: a.status,
    createdAt: a.created_at,
  }
}

export const appointmentsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true })
    if (error) throw new Error(error.message)
    return (data || []).map(toClient)
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)
    return toClient(data)
  },

  async create(data) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Oturum bulunamadı.')
    const payload = {
      owner_id: session.user.id,
      title: data.title,
      date: data.date,
      time: data.time,
      duration: data.duration || 60,
      attendee_id: data.attendeeId || data.attendee_id || null,
      attendee_name: data.attendeeName || data.attendee_name || null,
      listing_id: data.listingId || data.listing_id || null,
      listing_title: data.listingTitle || data.listing_title || null,
      location: data.location || null,
      description: data.description || null,
      status: data.status || 'bekliyor',
    }
    const { data: result, error } = await supabase
      .from('appointments')
      .insert(payload)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toClient(result)
  },

  async update(id, data) {
    const payload = {}
    if (data.title !== undefined) payload.title = data.title
    if (data.date !== undefined) payload.date = data.date
    if (data.time !== undefined) payload.time = data.time
    if (data.duration !== undefined) payload.duration = data.duration
    if (data.attendeeId !== undefined) payload.attendee_id = data.attendeeId
    if (data.attendeeName !== undefined) payload.attendee_name = data.attendeeName
    if (data.listingId !== undefined) payload.listing_id = data.listingId
    if (data.listingTitle !== undefined) payload.listing_title = data.listingTitle
    if (data.location !== undefined) payload.location = data.location
    if (data.description !== undefined) payload.description = data.description
    if (data.status !== undefined) payload.status = data.status

    const { data: result, error } = await supabase
      .from('appointments')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toClient(result)
  },

  async delete(id) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
  },
}
