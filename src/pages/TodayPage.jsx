import React, { useState, useEffect, useRef } from 'react'
import { makeGCalLink } from '../lib/calendarSync'

const todayKey = () => new Date().toISOString().slice(0, 10)
const getWeekNum = (d = new Date()) => { const s = new Date(d.getFullYear(), 0, 1); return Math.ceil(((d - s) / 86400000 + s.getDay() + 1) / 7) }
const todayName = () => new Date().toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 3)

const DEFAULT_TASKS = [
  { id: 't1', name: 'CKA troubleshooting session', tier: 'must', cat: 'c-k8s', weight: 20, priority: 1, startTime: '09:00', endTime: '10:30' },
  { id: 't2', name: '3 KodeKloud K8s labs', tier: 'must', cat: 'c-k8s', weight: 18, priority: 1, startTime: '10:45', endTime: '12:00' },
  { id: 't3', name: '3–5 interview questions (out loud)', tier: 'must', cat: 'c-int', weight: 12, priority: 2, startTime: '12:15', endTime: '13:00' },
  { id: 't4', name: 'Lab architecture planning', tier: 'must', cat: 'c-lab', weight: 10, priority: 2, startTime: '13:00', endTime: '14:00' },
  { id: 't5', name: '5 job applications (SE + NL)', tier: 'should', cat: 'c-job', weight: 12, priority: 2, startTime: '20:00', endTime: '21:00' },
  { id: 't6', name: 'Daily DevOps study (1.5 hrs)', tier: 'should', cat: 'c-cert', weight: 15, priority: 3, startTime: '08:30', endTime: '10:00' },
  { id: 't7', name: 'Evening review + set tomorrow Top 3', tier: 'should', cat: 'c-adm', weight: 6, priority: 3, startTime: '21:00', endTime: '21:15' },
  { id: 't8', name: 'Content plan ideas', tier: 'will', cat: 'c-cnt', weight: 6, priority: 0, startTime: '', endTime: '' },
  { id: 't9', name: 'Online income research (30 min)', tier: 'will', cat: 'c-adm', weight: 5, priority: 0, startTime: '', endTime: '' },
]

export default function TodayPage({ cats }) {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('h_tasks_v4') || JSON.stringify(DEFAULT_TASKS)))
  const [statuses, setStatuses] = useState(() => JSON.parse(localStorage.getItem(`h_ts_${todayKey()}`) || '{}'))
  const [weekScores] = useState(() => JSON.parse(localStorage.getItem('h_ws4') || '{}'))
  const [top3, setTop3] = useState(() => JSON.parse(localStorage.getItem(`h_top3_${todayKey()}`) || '[null,null,null]'))
  const [modal, setModal] = useState(null) // null | { mode: 'add'|'edit', tier?, task? }
  const [form, setForm] = useState({})
  const dragId = useRef(null)

  const saveTasks = (t) => { setTasks(t); localStorage.setItem('h_tasks_v4', JSON.stringify(t)) }
  const saveStatuses = (s) => { setStatuses(s); localStorage.setItem(`h_ts_${todayKey()}`, JSON.stringify(s)); saveWeekScore(s) }
  const saveTop3 = (t) => { setTop3(t); localStorage.setItem(`h_top3_${todayKey()}`, JSON.stringify(t)) }

  const saveWeekScore = (s) => {
    const score = tasks.reduce((acc, t) => { const st = s[t.id] || 'none'; return acc + (st === 'done' ? t.weight : st === 'half' ? Math.round(t.weight * 0.5) : 0) }, 0)
    const max = tasks.reduce((acc, t) => acc + t.weight, 0)
    const pct = max ? Math.round(score / max * 100) : 0
    const ws = JSON.parse(localStorage.getItem('h_ws4') || '{}')
    ws[todayName()] = pct
    localStorage.setItem('h_ws4', JSON.stringify(ws))
  }

  const cycleStatus = (id) => {
    const cur = statuses[id] || 'none'
    const next = cur === 'none' ? 'half' : cur === 'half' ? 'done' : 'none'
    saveStatuses({ ...statuses, [id]: next })
  }

  // Score
  const score = tasks.reduce((acc, t) => { const s = statuses[t.id] || 'none'; return acc + (s === 'done' ? t.weight : s === 'half' ? Math.round(t.weight * 0.5) : 0) }, 0)
  const max = tasks.reduce((acc, t) => acc + t.weight, 0)
  const pct = max ? Math.round(score / max * 100) : 0
  const grade = pct >= 85 ? 'A' : pct >= 70 ? 'B' : pct >= 55 ? 'C' : pct > 0 ? 'D' : '—'
  const streak = Object.values(weekScores).filter(v => v >= 55).length

  const getCat = (id) => cats.find(c => c.id === id) || { name: 'Other', color: '#888' }

  // Drag
  const onDragStart = (e, id) => { dragId.current = id; setTimeout(() => document.getElementById(`tc-${id}`)?.classList.add('dragging'), 0) }
  const onDragEnd = (id) => { document.getElementById(`tc-${id}`)?.classList.remove('dragging'); dragId.current = null }
  const onDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over') }
  const onDragLeave = (e) => e.currentTarget.classList.remove('drag-over')
  const onDrop = (e, slot) => {
    e.preventDefault(); e.currentTarget.classList.remove('drag-over')
    if (!dragId.current) return
    const newTop3 = [...top3].map(id => id === dragId.current ? null : id)
    newTop3[slot] = dragId.current
    saveTop3(newTop3)
  }
  const removeTop3 = (slot) => { const n = [...top3]; n[slot] = null; saveTop3(n) }

  // Modal
  const openAdd = (tier) => { setForm({ tier: tier || 'must', cat: cats[0]?.id || '', weight: 10, priority: 0, startTime: '', endTime: '' }); setModal({ mode: 'add' }) }
  const openEdit = (task) => { setForm({ ...task }); setModal({ mode: 'edit', task }) }
  const saveTask = () => {
    if (!form.name?.trim()) return
    if (modal.mode === 'add') saveTasks([...tasks, { id: 't' + Date.now(), ...form, weight: Number(form.weight) || 10, priority: Number(form.priority) || 0 }])
    else saveTasks(tasks.map(t => t.id === modal.task.id ? { ...t, ...form, weight: Number(form.weight), priority: Number(form.priority) } : t))
    setModal(null)
  }
  const deleteTask = (id) => { saveTasks(tasks.filter(t => t.id !== id)); saveTop3(top3.map(tid => tid === id ? null : tid)) }

  const tiers = [
    { id: 'must', label: '🔴 Must do', color: 'var(--flame)' },
    { id: 'should', label: '🟡 Should do', color: 'var(--gold)' },
    { id: 'will', label: '🟢 Will do', color: 'var(--accent2)' },
  ]

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
                {t && <button className="top3-remove" onClick={() => removeTop3(i)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14, padding: '2px 6px', borderRadius: 6 }}>✕</button>}
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
      <div className="progress"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>

      {/* Task tiers */}
      {tiers.map(tier => (
        <div className="sec" key={tier.id}>
          <div className="sec-header">
            <div className="sec-title" style={{ color: tier.color }}>{tier.label}</div>
            <button className="btn-add" onClick={() => openAdd(tier.id)}>+ add</button>
          </div>
          {tasks.filter(t => t.tier === tier.id).sort((a, b) => (b.priority || 0) - (a.priority || 0)).map(t => {
            const s = statuses[t.id] || 'none'
            const cat = getCat(t.cat)
            const calLink = t.startTime ? makeGCalLink({ title: t.name, startTime: t.startTime, endTime: t.endTime }) : null
            return (
              <div key={t.id} id={`tc-${t.id}`} className={`task-card p${t.priority || 0} status-${s}`} draggable onDragStart={e => onDragStart(e, t.id)} onDragEnd={() => onDragEnd(t.id)}>
                <div className="drag-handle">⠿</div>
                <div className={`task-check ${s}`} onClick={() => cycleStatus(t.id)} title={s === 'none' ? 'Tap: half done' : s === 'half' ? 'Tap: fully done' : 'Tap: unmark'}>
                  {s === 'done' ? '✓' : s === 'half' ? '½' : ''}
                </div>
                <div className="task-body">
                  <div className="task-name">{t.name}</div>
                  <div className="task-meta">
                    <span className="tag" style={{ background: cat.color + '18', color: cat.color }}>{cat.name}</span>
                    <span className="pts-tag">{t.weight}pt</span>
                    {t.startTime && <span className="time-tag">{t.startTime}{t.endTime ? `–${t.endTime}` : ''}</span>}
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
                <input value={form.startTime || ''} onChange={e => setForm({ ...form, startTime: e.target.value })} placeholder="09:00" />
              </div>
              <div className="form-group"><label className="form-label">End time</label>
                <input value={form.endTime || ''} onChange={e => setForm({ ...form, endTime: e.target.value })} placeholder="10:30" />
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
