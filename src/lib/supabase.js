import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = SUPABASE_URL
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

export const isSupabaseReady = () => !!supabase

// ── Generic CRUD ──────────────────────────────────────────────────
export const db = {
  async getAll(table) {
    if (supabase) {
      const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: true })
      if (error) throw error
      return data || []
    }
    return JSON.parse(localStorage.getItem('sb_' + table) || '[]')
  },

  async upsert(table, row) {
    if (supabase) {
      const { data, error } = await supabase.from(table).upsert(row, { onConflict: 'id' }).select().single()
      if (error) throw error
      return data
    }
    const rows = JSON.parse(localStorage.getItem('sb_' + table) || '[]')
    const idx = rows.findIndex(r => r.id === row.id)
    const newRow = { created_at: new Date().toISOString(), ...row }
    if (idx >= 0) rows[idx] = { ...rows[idx], ...newRow }
    else rows.push(newRow)
    localStorage.setItem('sb_' + table, JSON.stringify(rows))
    return newRow
  },

  async delete(table, id) {
    if (supabase) {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
      return
    }
    const rows = JSON.parse(localStorage.getItem('sb_' + table) || '[]')
    localStorage.setItem('sb_' + table, JSON.stringify(rows.filter(r => r.id !== id)))
  },
}

// ── Task statuses for a given day ─────────────────────────────────
export const getTaskStatuses = async (date) => {
  if (supabase) {
    const { data, error } = await supabase.from('task_statuses').select('*').eq('date', date)
    if (error) throw error
    const map = {}
    ;(data || []).forEach(r => { map[r.task_id] = r.status })
    return map
  }
  return JSON.parse(localStorage.getItem('sb_ts_' + date) || '{}')
}

export const setTaskStatus = async (taskId, date, status) => {
  const id = date + '_' + taskId
  if (supabase) {
    const { error } = await supabase.from('task_statuses').upsert(
      { id, task_id: taskId, date, status },
      { onConflict: 'id' }
    )
    if (error) throw error
    return
  }
  const map = JSON.parse(localStorage.getItem('sb_ts_' + date) || '{}')
  map[taskId] = status
  localStorage.setItem('sb_ts_' + date, JSON.stringify(map))
}

// ── Top 3 ─────────────────────────────────────────────────────────
export const getTop3 = async (date) => {
  if (supabase) {
    const { data, error } = await supabase.from('top3').select('*').eq('date', date).single()
    if (error && error.code !== 'PGRST116') throw error
    if (!data) return [null, null, null]
    return [data.slot0 || null, data.slot1 || null, data.slot2 || null]
  }
  return JSON.parse(localStorage.getItem('sb_top3_' + date) || '[null,null,null]')
}

export const setTop3 = async (date, slots) => {
  if (supabase) {
    const { error } = await supabase.from('top3').upsert(
      { id: date, date, slot0: slots[0], slot1: slots[1], slot2: slots[2], updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    if (error) throw error
    return
  }
  localStorage.setItem('sb_top3_' + date, JSON.stringify(slots))
}

// ── Week scores ───────────────────────────────────────────────────
export const getWeekScores = async () => {
  if (supabase) {
    const { data, error } = await supabase.from('week_scores').select('*')
    if (error) throw error
    const map = {}
    ;(data || []).forEach(r => { map[r.day_name] = r.score })
    return map
  }
  return JSON.parse(localStorage.getItem('sb_week_scores') || '{}')
}

export const setWeekScore = async (dayName, score) => {
  if (supabase) {
    const { error } = await supabase.from('week_scores').upsert(
      { id: dayName, day_name: dayName, score, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    if (error) throw error
    return
  }
  const map = JSON.parse(localStorage.getItem('sb_week_scores') || '{}')
  map[dayName] = score
  localStorage.setItem('sb_week_scores', JSON.stringify(map))
}
