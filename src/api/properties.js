import { supabase } from './supabase'

const PLACEHOLDER_IMG = 'https://placehold.co/600x400/f0ece6/1e1b2e?text=Emlak+Foto%C4%9F%C4%B1'

function parseAllImages(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === 'string') {
    return raw.split('|').map(s => s.trim()).filter(Boolean)
  }
  return []
}

function toClient(p) {
  if (!p) return null

  const priceFormatted = p.price_text || (p.price ? `₺${p.price.toLocaleString('tr-TR')}` : '')
  const sizeFormatted = p.size_text || (p.size ? `${p.size} m²` : '')
  const coords = (p.lat && p.lng) ? [p.lng, p.lat] : null

  const allImages = parseAllImages(p.all_images)
  const img = p.img || allImages[0] || PLACEHOLDER_IMG

  return {
    ...p,
    img,
    all_images: allImages,
    price: priceFormatted,
    size: sizeFormatted,
    desc: p.description || '',
    coords,
    ownerId: p.owner_id,
    priceText: p.price_text,
    sizeText: p.size_text,
    timeText: p.time_text,
    listOrder: p.list_order,
    isDaily: p.is_daily,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    owner: undefined,
    owner_id: undefined,
    price_text: undefined,
    size_text: undefined,
    time_text: undefined,
    list_order: undefined,
    is_daily: undefined,
    created_at: undefined,
    updated_at: undefined,
  }
}

function toServer(data) {
  const result = { ...data }
  if (data.ownerId !== undefined) { result.owner_id = data.ownerId; delete result.ownerId }
  if (data.priceText !== undefined) { result.price_text = data.priceText; delete result.priceText }
  if (data.sizeText !== undefined) { result.size_text = data.sizeText; delete result.sizeText }
  if (data.timeText !== undefined) { result.time_text = data.timeText; delete result.timeText }
  if (data.listOrder !== undefined) { result.list_order = data.listOrder; delete result.listOrder }
  if (data.isDaily !== undefined) { result.is_daily = data.isDaily; delete result.isDaily }
  delete result.createdAt; delete result.updatedAt; delete result.created_at; delete result.updated_at
  delete result.id
  return result
}

export const propertiesApi = {
  async getAll(params = {}) {
    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (params.type && params.type !== 'Tümü') {
      query = query.eq('type', params.type)
    }
    if (params.city) {
      query = query.ilike('city', `%${params.city}%`)
    }
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,location.ilike.%${params.search}%`)
    }
    if (params.price_min) {
      query = query.gte('price', parseInt(params.price_min))
    }
    if (params.price_max) {
      query = query.lte('price', parseInt(params.price_max))
    }
    if (params.limit) {
      query = query.limit(parseInt(params.limit))
    }
    if (params.offset) {
      query = query.range(parseInt(params.offset), parseInt(params.offset) + (parseInt(params.limit) || 20) - 1)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return { data: (data || []).map(toClient) }
  },

  async getDaily() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_daily', true)
      .order('created_at', { ascending: false })
      .limit(10)
    if (error) throw new Error(error.message)
    return (data || []).map(toClient)
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw new Error(error.message)
    return toClient(data)
  },

  async search(query) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%,city.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw new Error(error.message)
    return (data || []).map(toClient)
  },

  async create(data) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Oturum bulunamadı.')
    const payload = { ...toServer(data), owner_id: session.user.id }
    const { data: result, error } = await supabase
      .from('properties')
      .insert(payload)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toClient(result)
  },

  async update(id, data) {
    const { data: result, error } = await supabase
      .from('properties')
      .update({ ...toServer(data), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toClient(result)
  },

  async remove(id) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
  },
}
