import { supabase } from './supabase'

function mapNotif(n) {
  if (!n) return null
  return {
    id: n.id,
    type: n.type || 'system',
    title: n.title,
    description: n.description || '',
    time: n.created_at ? new Date(n.created_at).toLocaleString('tr-TR') : '',
    read: n.read,
  }
}

export const notificationsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw new Error(error.message)
    return Array.isArray(data) ? data.map(mapNotif) : []
  },

  async create(data) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Oturum bulunamadı.')
    const { data: result, error } = await supabase
      .from('notifications')
      .insert({
        user_id: session.user.id,
        type: data.type || 'system',
        title: data.title,
        description: data.description || null,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return mapNotif(result)
  },

  async markRead(id) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
    if (error) throw new Error(error.message)
  },

  async markAllRead() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Oturum bulunamadı.')
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', session.user.id)
      .eq('read', false)
    if (error) throw new Error(error.message)
  },

  subscribe(callback) {
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.new) callback(mapNotif(payload.new))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}
