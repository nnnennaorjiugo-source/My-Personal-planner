import React, { useState, useEffect, useRef } from 'react'
import { db, getTaskStatuses, setTaskStatus, getTop3, setTop3, getWeekScores, setWeekScore } from '../lib/supabase'
import { makeGCalLink } from '../lib/calendarSync'

const todayKey = () => new Date().toISOString().slice(0, 10)
const todayName = () => new Date().toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 3)

const DEFAULT_TASKS = [
  { id: 't1', name: 'CKA troubleshooting session', tier: 'must', cat: 'c-k8s', weight: 20, priority: 1, start_time: '09:00', end_time: '10:30' },
  { id: 't2', name: '3 KodeKloud K8s labs', tier: 'must', cat: 'c-k8s', weight: 18, priority: 1, start_time: '10:45', end_time: '12:00' },
  { id: 't3', name: '3–5 interview questions (out loud)', tier: 'must', cat: 'c-int', weight: 12, priority: 2, start_time: '12:15', end_time: '13:00' },
  { id: 't4', name: 'Lab architecture planning', tier: 'must', cat: 'c-lab', weight: 10, priority: 2, start_time: '13:00', end_time: '14:00' },
  { id: 't5', name: '5 job applications (SE + NL)', tier: 'should', cat: 'c-job', weight: 12, priority: 2, start_time: '20:00', end_time: '21:00' },
  { id: 't6', name: 'Daily DevOps study (1.5 hrs)', tier: 'should', cat: 'c-cert', weight: 15, priority: 3, start_time: '08:30', end_time: '10:00' },
  { id: 't7', name: 'Evening review + set tomorrow Top 3', tier: 'should', cat: 'c-adm', weight: 6, priority: 3, start_time: '21:00', end_time: '21:15' },
  { id: 't8', name: 'Content plan ideas', tier: 'will', cat: 'c-cnt', weight: 6, priority: 0, start_time: '', end_time: '' },
  { id: 't9', name: 'Online income research (30 min)', tier: 'will', cat: 'c-adm', weight: 5, priority: 0, start_time: '', end_time: '' },
]

export default function TodayPage({ cats }) {
  const [tasks, setTasks] = useState([])
  const [statuses, setStatuses] = useState({})
  const [weekScores, setWeekScores] = useState({})
  const [top3, setTop3State] = useState([null, null, null])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const dragId = useRef(null)
  const date = todayKey()

  // Load all data
  useEffect(() => {
    async function load() {
      try {
        const [t, s, t3, ws] = await Promise.all([
          db.getAll('tasks'),
          getTaskStatuses(date),
          getTop3(date),
          getWeekScores(),
        ])
        setTasks(t.length > 0 ? t : DEFAULT_TASKS)
        setStatuses(s)
        setTop3State(t3)
        setWeekScores(ws)
        // Seed default tasks if none exist
        if (t.length === 0) {
          for (const task of DEFAULT_TASKS) await db.upsert('tasks', task)
        }
      } catch (e) {
        console.error('Load error:', e)
        setTasks(DEFAULT_TASKS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getCat = (id) => cats.find(c => c.id === id) || { name: 'Other', color: '#888' }

  // Score calculation
  const score = tasks.reduce((acc, t) => {
    const s = statuses[t.id] || 'none'
    return acc + (s === 'done' ? t.weight : s === 'half' ? Math.round(t.weight * 0.5) : 0)
  }, 0)
  const max = tasks.reduce((acc, t) => acc + t.weight, 0)
  const pct = max ? Math.round(score / max * 100) : 0
  const grade = pct >= 85 ? 'A' : pct >= 70 ? 'B' : pct >= 55 ? 'C' : pct > 0 ? 'D' : '—'
  const streak = Object.values(weekScores).filter(v => v >= 55).length

  // Save score whenever it changes
  useEffect(() => {
    if (!loading) setWeekScore(todayName(), pct)
  }, [pct, loading])

  const cycleStatus = async (id) => {
    const cur = statuses[id] || 'none'
    const next = cur === 'none' ? 'half' : cur === 'half' ? 'done' : 'none'
    setStatuses(prev => ({ ...prev, [id]: next }))
    await setTaskStatus(id, date, next)
  }

  // Drag & Drop
  const onDragStart = (e, id) => { dragId.current = id; setTimeout(() => document.getElementById('tc-' + id)?.classList.add('dragging'), 0) }
  const onDragEnd = (id) => { document.getElementById('tc-' + id)?.classList.remove('dragging'); dragId.current = null }
  const onDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over') }
  const onDragLeave = (e) => e.currentTarget.classList.remove('drag-over')
  const onDrop = async (e, slot) => {
    e.preventDefault(); e.currentTarget.classList.remove('drag-over')
    if (!dragId.current) return
    const newTop3 = [...top3].map(id => id === dragId.current ? null : id)
    newTop3[slot] = dragId.current
    setTop3State(newTop3)
    await setTop3(date, newTop3)
  }
  const removeTop3 = async (slot) => {
    const n = [...top3]; n[slot] = null
    setTop3State(n)
    await setTop3(date, n)
  }

  // Task CRUD
  const openAdd = (tier) => { setForm({ tier: tier || 'must', cat: cats[0]?.id || '', weight: 10, priority: 0, start_time: '', end_time: '' }); setModal({ mode: 'add' }) }
  const openEdit = (task) => { setForm({ ...task }); setModal({ mode: 'edit', task }) }
  const saveTask = async () => {
    if (!form.name?.trim()) return
    const task = { ...form, id: modal.mode === 'add' ? 't' + Date.now() : modal.task.id, weight: Number(form.weight) || 10, priority: Number(form.priority) || 0 }
    await db.upsert('tasks', task)
    setTasks(prev => modal.mode === 'add' ? [...prev, task] : prev.map(t => t.id === task.id ? task : t))
    setModal(null)
  }
  const deleteTask = async (id) => {
    await db.delete('tasks', id)
    setTasks(prev => prev.filter(t => t.id !== id))
    setTop3State(prev => prev.map(tid => tid === id ? null : tid))
    await setTop3(date, top3.map(tid => tid === id ? null : tid))
  }

  const tiers = [
    { id: 'must', label: '🔴 Must do', color: 'var(--flame)' },
    { id: 'should', label: '🟡 Should do', color: 'var(--gold)' },
    { id: 'will', label: '🟢 Will do', color: 'var(--accent2)' },
  ]

  if (loading) return <div style={{ color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, padding: '40px 0' }}>Loading tasks...</div>

  const d = new Date()
  return (
    <div>
      <div className="page-title">{d.toLocaleDateString('en-GB', { weekday: 'long' })}</div>
      <div className="page-sub">{d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>

      {/* Top 3 */}
      <div className="top3-strip">
        <div className="top3-label">Top 3 priorities</div>
        <div className="drag-hint">⠿ Drag any task below into a slot</div>
        <div className="top3-slots">
          {[0, 1, 2].map(i => {
            const t = top3[i] ? tasks.find(t => t.id === top3[i]) : null
            const s = t ? (statuses[t.id] || 'none') : null
            return (
              <div key={i} className={`top3-slot${t ? ' filled' : ''}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={e => onDrop(e, i)}>
                <div className={`top3-rank r${i + 1}`}>#{i + 1}</div>
                <div className={`top3-text${t ? ' filled' : ''}`}>{t ? `${t.name}${s === 'done' ? ' ✓' : s === 'half' ? ' ½' : ''}` : 'Drop a task here'}</div>
                {t && <button onClick={() => removeTop3(i)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14, padding: '2px 6px', borderRadius: 6 }}>✕</button>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="stat-row">
        <div className="stat"><div className="stat-val">{score}</div><div className="stat-lbl">Score</div></div>
        <div className="stat"><div className="stat-val">{pct}%</div><div className="stat-lbl">Done</div></div>
        <div className="stat"><div className="stat-val">{grade}</div><div className="stat-lbl">Grade</div></div>
        <div className="stat"><div className="stat-val">{streak}</div><div className="stat-lbl">Streak</div></div>
      </div>
      <div className="progress"><div className="progress-fill" style={{ width: pct + '%' }} /></div>

      {/* Tasks */}
      {tiers.map(tier => (
        <div className="sec" key={tier.id}>
          <div className="sec-header">
            <div className="sec-title" style={{ color: tier.color }}>{tier.label}</div>
            <button className="btn-add" onClick={() => openAdd(tier.id)}>+ add</button>
          </div>
          {tasks.filter(t => t.tier === tier.id).sort((a, b) => (b.priority || 0) - (a.priority || 0)).map(t => {
            const s = statuses[t.id] || 'none'
            const cat = getCat(t.cat)
            const calLink = (t.start_time || t.startTime) ? makeGCalLink({ title: t.name, startTime: t.start_time || t.startTime, endTime: t.end_time || t.endTime }) : null
            return (
              <div key={t.id} id={'tc-' + t.id} className={`task-card p${t.priority || 0} status-${s}`} draggable onDragStart={e => onDragStart(e, t.id)} onDragEnd={() => onDragEnd(t.id)}>
                <div className="drag-handle">⠿</div>
                <div className={`task-check ${s}`} onClick={() => cycleStatus(t.id)} title={s === 'none' ? 'Tap: half done' : s === 'half' ? 'Tap: fully done' : 'Tap: unmark'}>
                  {s === 'done' ? '✓' : s === 'half' ? '½' : ''}
                </div>
                <div className="task-body">
                  <div className="task-name">{t.name}</div>
                  <div className="task-meta">
                    <span className="tag" style={{ background: cat.color + '18', color: cat.color }}>{cat.name}</span>
                    <span className="pts-tag">{t.weight}pt</span>
                    {(t.start_time || t.startTime) && <span className="time-tag">{t.start_time || t.startTime}{(t.end_time || t.endTime) ? '–' + (t.end_time || t.endTime) : ''}</span>}
                    {s === 'half' && <span className="half-badge">½ done</span>}
                    {s === 'done' && <span className="done-badge">✓ done</span>}
                  </div>
                </div>
                <div className="task-actions">
                  {calLink && <a className="cal-btn" href={calLink} target="_blank" rel="noreferrer">📅 Cal</a>}
                  <button className="icon-btn" onClick={() => openEdit(t)}>✏</button>
                  <button className="icon-btn del" onClick={() => deleteTask(t.id)}>🗑</button>
                </div>
              </div>
            )
          })}
          {tasks.filter(t => t.tier === tier.id).length === 0 && (
            <div style={{ color: 'var(--text3)', fontSize: 12, padding: '10px 0', fontFamily: 'JetBrains Mono, monospace' }}>No tasks here</div>
          )}
        </div>
      ))}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-title">{modal.mode === 'add' ? 'Add task' : 'Edit task'}</div>
            <div className="form-group"><label className="form-label">Task name</label>
              <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="What needs doing?" />
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Tier</label>
                <select value={form.tier || 'must'} onChange={e => setForm({ ...form, tier: e.target.value })}>
                  <option value="must">Must do</option><option value="should">Should do</option><option value="will">Will do</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Category</label>
                <select value={form.cat || ''} onChange={e => setForm({ ...form, cat: e.target.value })}>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Weight (pts)</label>
                <input type="number" value={form.weight || 10} onChange={e => setForm({ ...form, weight: e.target.value })} min="1" max="30" />
              </div>
              <div className="form-group"><label className="form-label">Priority</label>
                <select value={form.priority || 0} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="0">Normal</option><option value="1">🔴 Critical</option><option value="2">🟡 High</option><option value="3">🟢 Medium</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Start time</label>
                <input value={form.start_time || form.startTime || ''} onChange={e => setForm({ ...form, start_time: e.target.value })} placeholder="09:00" />
              </div>
              <div className="form-group"><label className="form-label">End time</label>
                <input value={form.end_time || form.endTime || ''} onChange={e => setForm({ ...form, end_time: e.target.value })} placeholder="10:30" />
              </div>
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={saveTask}>Save</button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              {modal.mode === 'edit' && <button className="btn btn-danger btn-sm" onClick={() => { deleteTask(modal.task.id); setModal(null) }} style={{ marginLeft: 'auto' }}>Delete</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
