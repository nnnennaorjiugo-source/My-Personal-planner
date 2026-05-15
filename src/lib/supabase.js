import { createClient } from '@supabase/supabase-js'

// These come from your .env file (see README for setup)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = SUPABASE_URL
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

// Local storage fallback when Supabase not configured
export const isSupabaseReady = () => !!SUPABASE_URL

export const db = {
  async getAll(table) {
    if (supabase) {
      const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: true })
      if (error) throw error
      return data
    }
    const stored = localStorage.getItem(`h_${table}`)
    return stored ? JSON.parse(stored) : []
  },
  async insert(table, row) {
    if (supabase) {
      const { data, error } = await supabase.from(table).insert(row).select().single()
      if (error) throw error
      return data
    }
    const rows = await db.getAll(table)
    const newRow = { ...row, id: Date.now().toString(), created_at: new Date().toISOString() }
    localStorage.setItem(`h_${table}`, JSON.stringify([...rows, newRow]))
    return newRow
  },
  async update(table, id, updates) {
    if (supabase) {
      const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    }
    const rows = await db.getAll(table)
    const updated = rows.map(r => r.id === id ? { ...r, ...updates } : r)
    localStorage.setItem(`h_${table}`, JSON.stringify(updated))
    return updated.find(r => r.id === id)
  },
  async delete(table, id) {
    if (supabase) {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
      return
    }
    const rows = await db.getAll(table)
    localStorage.setItem(`h_${table}`, JSON.stringify(rows.filter(r => r.id !== id)))
  }
}
