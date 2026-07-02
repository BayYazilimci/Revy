import { supabase } from './supabase'

function toClient(w) {
  if (!w) return null
  return {
    ...w,
    companyInfo: w.company_info,
    templateId: w.template_id,
    customDomain: w.custom_domain,
    domainVerified: w.domain_verified,
    metaTitle: w.meta_title,
    metaDescription: w.meta_description,
    publishedAt: w.published_at,
    createdAt: w.created_at,
    updatedAt: w.updated_at,
    company_info: undefined,
    template_id: undefined,
    custom_domain: undefined,
    domain_verified: undefined,
    meta_title: undefined,
    meta_description: undefined,
    published_at: undefined,
    created_at: undefined,
    updated_at: undefined,
  }
}

function toServer(data) {
  const out = {}
  if (data.name !== undefined) out.name = data.name
  if (data.slug !== undefined) out.slug = data.slug
  if (data.templateId !== undefined) out.template_id = data.templateId
  if (data.companyInfo !== undefined) out.company_info = data.companyInfo
  if (data.sections !== undefined) out.sections = data.sections
  if (data.listings !== undefined) out.listings = data.listings
  if (data.colors !== undefined) out.colors = data.colors
  if (data.status !== undefined) out.status = data.status
  if (data.customDomain !== undefined) out.custom_domain = data.customDomain
  if (data.domainVerified !== undefined) out.domain_verified = data.domainVerified
  if (data.metaTitle !== undefined) out.meta_title = data.metaTitle
  if (data.metaDescription !== undefined) out.meta_description = data.metaDescription
  if (data.favicon !== undefined) out.favicon = data.favicon
  if (data.publishedAt !== undefined) out.published_at = data.publishedAt
  return out
}

export const websitesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(toClient)
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return toClient(data)
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    if (error) throw error
    return toClient(data)
  },

  async create(websiteData) {
    const serverData = toServer(websiteData)
    const { data: { user } } = await supabase.auth.getUser()
    serverData.user_id = user.id

    const baseSlug = (websiteData.name || 'site')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    let slug = baseSlug
    let counter = 1
    while (true) {
      const { data: existing } = await supabase
        .from('websites')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
      if (!existing) break
      slug = `${baseSlug}-${counter}`
      counter++
    }
    serverData.slug = slug

    const { data, error } = await supabase
      .from('websites')
      .insert(serverData)
      .select()
      .single()
    if (error) throw error
    return toClient(data)
  },

  async update(id, websiteData) {
    const serverData = toServer(websiteData)
    const { data, error } = await supabase
      .from('websites')
      .update(serverData)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toClient(data)
  },

  async delete(id) {
    const { error } = await supabase
      .from('websites')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async publish(id) {
    const slug = await this._generateUniqueSlug(id)
    const { data, error } = await supabase
      .from('websites')
      .update({
        status: 'published',
        slug,
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toClient(data)
  },

  async unpublish(id) {
    const { data, error } = await supabase
      .from('websites')
      .update({
        status: 'draft',
        published_at: null,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toClient(data)
  },

  async _generateUniqueSlug(id) {
    const { data: website } = await supabase
      .from('websites')
      .select('name')
      .eq('id', id)
      .single()

    const baseSlug = (website?.name || 'site')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    let slug = baseSlug
    let counter = 1

    while (true) {
      const { data: existing } = await supabase
        .from('websites')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .maybeSingle()

      if (!existing) return slug
      slug = `${baseSlug}-${counter}`
      counter++
    }
  },
}
