import { supabase } from './supabase'

function toClientAssociation(raw) {
  if (!raw) return null
  return {
    id: raw.id,
    customerId: raw.customer_id,
    propertyId: raw.property_id,
    ilanId: raw.property_id,
    not: raw.relation || '',
    property: raw.property || null,
    customer_id: undefined,
    property_id: undefined,
  }
}

export const customerListingsApi = {
  async getForCustomer(musteriId) {
    const { data, error } = await supabase
      .from('customer_listings')
      .select('*, property:properties(*)')
      .eq('customer_id', musteriId)
    if (error) throw new Error(error.message)
    return Array.isArray(data) ? data.map(toClientAssociation) : []
  },

  async associate(musteriId, ilanId) {
    const { data: existing } = await supabase
      .from('customer_listings')
      .select('id')
      .eq('customer_id', musteriId)
      .eq('property_id', ilanId)
      .maybeSingle()

    if (existing) return toClientAssociation(existing)

    const { data, error } = await supabase
      .from('customer_listings')
      .insert({ customer_id: musteriId, property_id: ilanId })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toClientAssociation(data)
  },

  async disassociate(musteriId, ilanId) {
    const { error } = await supabase
      .from('customer_listings')
      .delete()
      .eq('customer_id', musteriId)
      .eq('property_id', ilanId)
    if (error) throw new Error(error.message)
  },

  async updateNote(musteriId, ilanId, not) {
    const { data: existing } = await supabase
      .from('customer_listings')
      .select('id')
      .eq('customer_id', musteriId)
      .eq('property_id', ilanId)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('customer_listings')
        .update({ relation: not })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return toClientAssociation(data)
    }

    const { data, error } = await supabase
      .from('customer_listings')
      .insert({ customer_id: musteriId, property_id: ilanId, relation: not })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return toClientAssociation(data)
  },
}
