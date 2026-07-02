import { supabase } from './supabase'

function toClient(l) {
  if (!l) return null
  return {
    id: l.id,
    userId: l.user_id,
    name: l.name,
    color: l.color,
    icon: l.icon,
    createdAt: l.created_at,
    items: (l.list_items || []).map(i => ({
      id: i.id,
      propertyId: i.property_id,
      addedAt: i.added_at,
      notes: i.notes || '',
    })),
    user_id: undefined,
    created_at: undefined,
    list_items: undefined,
  }
}

export const listsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('lists')
      .select('*, list_items(*)')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data || []).map(toClient)
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('lists')
      .select('*, list_items(*)')
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)
    return toClient(data)
  },

  async create(data) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Oturum bulunamadı.')
    const { data: result, error } = await supabase
      .from('lists')
      .insert({
        user_id: session.user.id,
        name: data.name,
        color: data.color,
        icon: data.icon,
      })
      .select('*, list_items(*)')
      .single()
    if (error) throw new Error(error.message)
    return toClient(result)
  },

  async update(id, data) {
    const payload = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.color !== undefined) payload.color = data.color
    if (data.icon !== undefined) payload.icon = data.icon

    const { data: result, error } = await supabase
      .from('lists')
      .update(payload)
      .eq('id', id)
      .select('*, list_items(*)')
      .single()
    if (error) throw new Error(error.message)
    return toClient(result)
  },

  async delete(id) {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
  },

  async addItem(listId, propertyId) {
    const { data: existing } = await supabase
      .from('list_items')
      .select('id')
      .eq('list_id', listId)
      .eq('property_id', propertyId)
      .maybeSingle()
    if (!existing) {
      const { error } = await supabase
        .from('list_items')
        .insert({ list_id: listId, property_id: propertyId })
      if (error) throw new Error(error.message)
    }
    return this.getById(listId)
  },

  async removeItem(listId, propertyId) {
    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('list_id', listId)
      .eq('property_id', propertyId)
    if (error) throw new Error(error.message)
    return this.getById(listId)
  },

  async updateItemNote(listId, propertyId, notes) {
    const { error } = await supabase
      .from('list_items')
      .update({ notes: notes || '' })
      .eq('list_id', listId)
      .eq('property_id', propertyId)
    if (error) throw new Error(error.message)
    return this.getById(listId)
  },
}
