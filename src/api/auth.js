import { supabase } from './supabase'

function mapUser(session) {
  if (!session?.user) return null
  const u = session.user
  return {
    id: u.id,
    username: u.email?.split('@')[0] || '',
    email: u.email,
    name: u.user_metadata?.name || u.email?.split('@')[0] || '',
    firstName: u.user_metadata?.first_name || '',
    lastName: u.user_metadata?.last_name || '',
    avatar: u.user_metadata?.avatar_url || u.user_metadata?.avatar || '',
    phone: u.user_metadata?.phone || '',
    role: u.user_metadata?.role || 'user',
    status: u.user_metadata?.status || 'aktif',
    banReason: u.user_metadata?.ban_reason,
    city: u.user_metadata?.city || '',
    profileCompleted: u.user_metadata?.profile_completed || false,
    profile: u.user_metadata?.profile || null,
    subscription: null,
  }
}

async function fetchProfile(userId) {
  if (!userId) return null
  const { data } = await supabase
    .from('users')
    .select('*, subscription:subscriptions(*)')
    .eq('id', userId)
    .single()
  return data
}

function enrichUser(sessionUser, profile) {
  if (!sessionUser) return null
  const sub = profile?.subscription
  const { role: _profileRole, ...profileRest } = profile || {}
  // Admin rolü her iki kaynaktan da gelebilir; en yüksek yetkiyi tercih et
  const metaRole = sessionUser.role
  const dbRole = _profileRole
  const finalRole = (metaRole === 'admin' || dbRole === 'admin') ? 'admin' : (metaRole || dbRole || 'user')
  return {
    ...sessionUser,
    ...profileRest,
    role: finalRole,
    subscription: sub
      ? {
          planId: sub.plan_id,
          status: sub.status,
          since: sub.since,
          renewsAt: sub.renews_at,
        }
      : null,
  }
}

export const authApi = {
  async login(emailOrUsername, password) {
    let email = emailOrUsername
    if (!emailOrUsername.includes('@')) {
      console.log('[LOGIN] Username lookup:', emailOrUsername)

      // 1) RPC ile ara
      const { data: rpcEmail, error: rpcError } = await supabase.rpc('get_email_by_username', {
        p_username: emailOrUsername,
      })
      console.log('[LOGIN] RPC result:', { rpcEmail, rpcError: rpcError?.message })

      if (!rpcError && rpcEmail) {
        email = rpcEmail
        console.log('[LOGIN] Email from RPC:', email)
      } else {
        // 2) public.users tablosundan doğrudan ara
        const { data: row, error: queryError } = await supabase
          .from('users')
          .select('email')
          .eq('username', emailOrUsername)
          .maybeSingle()
        console.log('[LOGIN] Direct query result:', { row, queryError: queryError?.message })

        if (row?.email) {
          email = row.email
          console.log('[LOGIN] Email from direct query:', email)
        } else {
          // 3) Son çare: auth.users'da raw_user_meta_data'dan ara
          console.log('[LOGIN] Trying auth.users metadata fallback...')
          const { data: authUsers, error: authError } = await supabase
            .from('users')
            .select('email, username')
            .ilike('email', `${emailOrUsername}%`)
            .maybeSingle()
          console.log('[LOGIN] Email pattern fallback:', { authUsers, authError: authError?.message })

          if (authUsers?.email) {
            email = authUsers.email
            console.log('[LOGIN] Email from pattern match:', email)
          } else {
            // 4) fsbo.local email ile dene
            const fsboEmail = `${emailOrUsername}@fsbo.local`
            console.log('[LOGIN] Trying fsbo.local email:', fsboEmail)
            email = fsboEmail
          }
        }
      }
    }
    console.log('[LOGIN] Final email:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      const msg = error.message || error.error_description || 'Kullanıcı adı veya şifre hatalı.'
      console.error('[LOGIN] signIn error:', msg)
      throw new Error(msg)
    }
    const profile = await fetchProfile(data.user?.id)
    const enriched = enrichUser(mapUser(data), profile)
    console.log('[LOGIN] User role:', enriched?.role, '(metadata:', data.user?.user_metadata?.role, '| db:', profile?.role, ')')
    return enriched
  },

  async register({ username, password, firstName, lastName, email }) {
    if (!username || !username.trim()) throw new Error('Kullanıcı adı zorunludur.')
    if (!password) throw new Error('Şifre zorunludur.')
    if (!firstName || !firstName.trim()) throw new Error('Ad zorunludur.')
    if (!lastName || !lastName.trim()) throw new Error('Soyad zorunludur.')
    const signupEmail = email || `${username.trim()}@fsbo.local`
    console.log('[REGISTER] Signing up:', { username, email: signupEmail })
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password,
      options: {
        data: {
          username,
          first_name: firstName,
          last_name: lastName,
          name: [firstName, lastName].filter(Boolean).join(' '),
          role: 'user',
          status: 'aktif',
          profile_completed: false,
        },
      },
    })
    if (error) throw new Error(error.message || 'Kayıt başarısız.')
    console.log('[REGISTER] SignUp success:', { userId: data.user?.id, emailConfirmed: data.user?.email_confirmed_at })

    if (data.user) {
      const name = [firstName, lastName].filter(Boolean).join(' ') || username
      const { error: insertError } = await supabase.from('users').upsert({
        id: data.user.id,
        username: username.trim(),
        email: signupEmail,
        name,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role: 'user',
        status: 'aktif',
        profile_completed: false,
      }, { onConflict: 'id' })
      if (insertError) {
        console.warn('[REGISTER] users upsert failed:', insertError.message)
        // Trigger çalışmadıysa, RPC ile senkronize etmeyi dene
        console.log('[REGISTER] Trying RPC sync as fallback...')
        const { error: rpcErr } = await supabase.rpc('get_email_by_username', { p_username: username })
        if (rpcErr) {
          console.warn('[REGISTER] RPC sync also failed:', rpcErr.message)
        }
      } else {
        console.log('[REGISTER] users upsert success')
      }
    }

    const profile = await fetchProfile(data.user?.id)
    return {
      user: enrichUser(mapUser(data), profile),
      needsProfile: true,
    }
  },

  async me() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null
    const profile = await fetchProfile(session.user.id)
    const enriched = enrichUser(mapUser(session), profile)
    console.log('[ME] User role:', enriched?.role, '(metadata:', session.user?.user_metadata?.role, '| db:', profile?.role, ')')
    return enriched
  },

  async logout() {
    await supabase.auth.signOut()
  },

  async updateProfile(updates) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Oturum bulunamadı.')

    const profileFields = {}
    if (updates.name !== undefined) profileFields.name = updates.name
    if (updates.phone !== undefined) profileFields.phone = updates.phone
    if (updates.avatar !== undefined) profileFields.avatar = updates.avatar
    if (updates.city !== undefined) profileFields.city = updates.city
    if (updates.profileCompleted !== undefined) profileFields.profile_completed = updates.profileCompleted
    if (updates.profile !== undefined) profileFields.profile = updates.profile

    if (Object.keys(profileFields).length > 0) {
      const { error } = await supabase
        .from('users')
        .update({ ...profileFields, updated_at: new Date().toISOString() })
        .eq('id', session.user.id)
      if (error) throw new Error(error.message)
    }

    const authUpdate = {}
    if (updates.email) authUpdate.email = updates.email

    const metadataUpdates = {}
    if (updates.profileCompleted !== undefined) metadataUpdates.profile_completed = updates.profileCompleted
    if (updates.name !== undefined) metadataUpdates.name = updates.name
    if (updates.phone !== undefined) metadataUpdates.phone = updates.phone
    if (updates.avatar !== undefined) metadataUpdates.avatar = updates.avatar
    if (updates.city !== undefined) metadataUpdates.city = updates.city
    if (updates.profile !== undefined) metadataUpdates.profile = updates.profile

    if (Object.keys(metadataUpdates).length > 0) {
      authUpdate.data = metadataUpdates
    }

    if (Object.keys(authUpdate).length > 0) {
      const { error } = await supabase.auth.updateUser(authUpdate)
      if (error) throw new Error(error.message)
    }

    const { data: { user } } = await supabase.auth.getUser()
    const profile = await fetchProfile(user?.id)
    return enrichUser(mapUser({ user }), profile)
  },

  async updatePassword(currentPassword, newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message || 'Şifre güncellenemedi.')
  },

  async forgotPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/sifremi-unuttum`,
    })
    if (error) throw new Error(error.message || 'İşlem başarısız.')
  },

  async subscribe(planId) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Oturum bulunamadı.')
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: session.user.id,
        plan_id: planId,
        status: 'active',
        since: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async cancelSubscription() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Oturum bulunamadı.')
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('user_id', session.user.id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async getInvoices() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return []
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })
    if (error) throw new Error(error.message)
    return data || []
  },
}
