import React, { useState, useEffect } from 'react'
import { db } from '../lib/supabase'

const getWeekNum = (d = new Date()) => { const s = new Date(d.getFullYear(), 0, 1); return Math.ceil(((d - s) / 86400000 + s.getDay() + 1) / 7) }
const weeklyPeriods = () => { const w = getWeekNum(); return Array.from({ length: 8 }, (_, i) => 'Week ' + (w + i - 1)) }
const monthlyPeriods = ['May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const quarterlyPeriods = ['Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027']

const DEFAULT_GOALS = [
  { id: 'g1', name: 'Content calendar done', term: 'weekly', period: 'Week ' + (getWeekNum() + 1), cat: 'c-cnt', priority: 1, deadline: 'May 21', done: false },
  { id: 'g2', name: 'Home lab architecture drafted', term: 'weekly', period: 'Week ' + (getWeekNum() + 1), cat: 'c-lab', priority: 1, deadline: 'May 21', done: false },
  { id: 'g3', name: 'Swedbank / bank ID sorted', term: 'weekly', period: 'Week ' + getWeekNum(), cat: 'c-adm', priority: 1, deadline: 'May 16', done: false },
  { id: 'g4', name: 'CNCF paper submitted', term: 'weekly', period: 'Week ' + (getWeekNum() + 1), cat: 'c-cert', priority: 1, deadline: 'May 25', done: false },
  { id: 'g5', name: 'First content piece LIVE', term: 'monthly', period: 'May', cat: 'c-cnt', priority: 1, deadline: 'May 31', done: false },
  { id: 'g6', name: 'Home lab continuously running', term: 'monthly', period: 'May', cat: 'c-lab', priority: 2, deadline: 'May 31', done: false },
  { id: 'g7', name: 'MLOps learning started', term: 'monthly', period: 'June', cat: 'c-cert', priority: 3, deadline: 'June 1', done: false },
  { id: 'g8', name: 'CKA exam', term: 'quarterly', period: 'Q4 2026', cat: 'c-cert', priority: 1, deadline: 'Oct 15', done: false },
  { id: 'g9', name: 'LFCS exam', term: 'quarterly', period: 'Q4 2026', cat: 'c-cert', priority: 1, deadline: 'Oct 1', done: false },
  { id: 'g10', name: 'US job applications push', term: 'quarterly', period: 'Q3 2026', cat: 'c-job', priority: 1, deadline: 'August', done: false },
]

export default function GoalsPage({ cats, initialView, onViewChange }) {
  const [goals, setGoals] = useState([])
  const [view, setView] = useState(initialView || 'weekly')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (initialView) setView(initialView) }, [initialView])

  useEffect(() => {
    async function load() {
      try {
        const data = await db.getAll('goals')
        if (data.length > 0) setGoals(data)
        else {
          setGoals(DEFAULT_GOALS)
          for (const g of DEFAULT_GOALS) await db.upsert('goals', g)
        }
      } catch (e) { setGoals(DEFAULT_GOALS) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const getPeriods = (t) => t === 'weekly' ? weeklyPeriods() : t === 'monthly' ? monthlyPeriods : quarterlyPeriods
  const getCat = (id) => cats.find(c => c.id === id) || { name: 'Other', color: '#888' }
  const priColors = { 1: 'var(--flame)', 2: 'var(--gold)', 3: 'var(--accent2)' }
  const filtered = goals.filter(g => g.term === view)
  const periods = [...new Set(filtered.map(g => g.period))].sort((a, b) => getPeriods(view).indexOf(a) - getPeriods(view).indexOf(b))

  const switchView = (v) => { setView(v); onViewChange?.(v) }

  const toggleGoal = async (id) => {
    const g = goals.find(g => g.id === id)
    if (!g) return
    const updated = { ...g, done: !g.done }
    setGoals(prev => prev.map(x => x.id === id ? updated : x))
    await db.upsert('goals', updated)
  }

  const openAdd = () => {
    setForm({ term: view, period: getPeriods(view)[0], cat: cats[0]?.id || '', priority: 2, deadline: '', name: '' })
    setModal({ mode: 'add' })
  }

  const save = async () => {
    if (!form.name?.trim()) return
    const goal = { ...form, id: modal.mode === 'add' ? 'g' + Date.now() : modal.goal?.id, done: false }
    await db.upsert('goals', goal)
    setGoals(prev => modal.mode === 'add' ? [...prev, goal] : prev.map(g => g.id === goal.id ? goal : g))
    setModal(null)
  }

  const deleteGoal = async (id) => {
    await db.delete('goals', id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  if (loading) return <div style={{ color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, padding: '40px 0' }}>Loading goals...</div>

  return (
    <div>
      <div className="page-title">Goals</div>
      <div className="page-sub">Week by week · Month by month · Quarterly</div>
      <div className="filters">
        {['weekly', 'monthly', 'quarterly'].map(v => (
          <button key={v} className={'filter-btn' + (view === v ? ' active' : '')} onClick={() => switchView(v)}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {periods.length === 0 && <div style={{ color: 'var(--text3)', padding: '20px 0', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>No {view} goals yet</div>}

      {periods.map(period => {
        const pg = filtered.filter(g => g.period === period).sort((a, b) => (a.priority || 9) - (b.priority || 9))
        const done = pg.filter(g => g.done).length
        return (
          <div key={period}>
            <div className="period-header">
              <div className="period-title">{period}</div>
              <div className="period-count">{done}/{pg.length}</div>
            </div>
            {pg.map(g => {
              const cat = getCat(g.cat)
              return (
                <div key={g.id} className="goal-card">
                  <div className="priority-dot" style={{ background: priColors[g.priority] || 'var(--text3)' }} />
                  <div className={'goal-check' + (g.done ? ' done' : '')} onClick={() => toggleGoal(g.id)}>{g.done ? '✓' : ''}</div>
                  <div style={{ flex: 1 }}>
                    <div className={'goal-name' + (g.done ? ' done' : '')}>{g.name}</div>
                    <div className="goal-meta">
                      <span style={{ background: cat.color + '18', color: cat.color, padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{cat.name}</span>
                      {g.deadline && <span>📅 {g.deadline}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="icon-btn" onClick={() => { setForm({ ...g }); setModal({ mode: 'edit', goal: g }) }}>✏</button>
                    <button className="icon-btn del" onClick={() => deleteGoal(g.id)}>🗑</button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      <button className="btn btn-ghost btn-sm" onClick={openAdd} style={{ marginTop: 12 }}>+ Add goal</button>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-title">{modal.mode === 'add' ? 'Add goal' : 'Edit goal'}</div>
            <div className="form-group"><label className="form-label">Goal</label>
              <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="What do you want to achieve?" />
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Timeframe</label>
                <select value={form.term || view} onChange={e => setForm({ ...form, term: e.target.value, period: getPeriods(e.target.value)[0] })}>
                  <option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Period</label>
                <select value={form.period || ''} onChange={e => setForm({ ...form, period: e.target.value })}>
                  {getPeriods(form.term || view).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Priority</label>
                <select value={form.priority || 2} onChange={e => setForm({ ...form, priority: Number(e.target.value) })}>
                  <option value="1">🔴 High</option><option value="2">🟡 Medium</option><option value="3">🟢 Low</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Category</label>
                <select value={form.cat || ''} onChange={e => setForm({ ...form, cat: e.target.value })}>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Deadline</label>
              <input value={form.deadline || ''} onChange={e => setForm({ ...form, deadline: e.target.value })} placeholder="e.g. May 31" />
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={save}>Save</button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
