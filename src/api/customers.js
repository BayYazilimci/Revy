import { supabase } from './supabase'

function toClient(c) {
  if (!c) return null
  let extra = {}
  try { extra = c.notes ? JSON.parse(c.notes) : {} } catch { }
  const nameParts = (c.name || '').split(' ')
  return {
    id: c.id,
    ad: nameParts[0] || '',
    soyad: nameParts.slice(1).join(' ') || '',
    email: c.email || '',
    telefon: c.phone || '',
    sirket: extra.sirket || '',
    sektor: extra.sektor || '',
    notlar: extra.notlar || '',
    createdAt: c.created_at,
    ownerId: c.owner_id,
    created_at: undefined,
    owner_id: undefined,
  }
}

function toServer(data) {
  const name = [data.ad, data.soyad].filter(Boolean).join(' ')
  const extra = { sirket: data.sirket || '', sektor: data.sektor || '', notlar: data.notlar || '' }
  const notesStr = Object.values(extra).some(v => v) ? JSON.stringify(extra) : undefined
  return {
    name,
    email: data.email || undefined,
    phone: data.telefon || undefined,
    notes: notesStr,
  }
}

export const customersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return Array.isArray(data) ? data.map(toClient) : []
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)
    return toClient(data)
  },

  async create(data) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Oturum bulunamadı.')
    const { data: result, error } = await supabase
      .from('customers')
      .insert({ ...toServer(data), owner_id: session.user.id })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toClient(result)
  },

  async update(id, data) {
    const { data: result, error } = await supabase
      .from('customers')
      .update({ ...toServer(data), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toClient(result)
  },

  async delete(id) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
  },
}
