import React, { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import { makeHairClientCalLink } from '../lib/calendarSync'

const STYLES = ['Box braids','Knotless braids','Cornrows','Loc retwist','Loc starter','Faux locs','Twist out','Weave/sew-in','Wig install','Natural styling','Other']

function daysUntil(dateStr) {
  const d = new Date(dateStr)
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return Math.round((d - now) / 86400000)
}

export default function HairClientsPage() {
  const [clients, setClients] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [filter, setFilter] = useState('upcoming')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.getAll('hair_clients').then(data => { setClients(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const openAdd = () => {
    setForm({ date: new Date().toISOString().slice(0,10), start_time: '10:00', end_time: '14:00', deposit_paid: false, style: STYLES[0], amount: '', name: '', contact: '', notes: '' })
    setModal({ mode: 'add' })
  }
  const openEdit = (c) => { setForm({ ...c }); setModal({ mode: 'edit', client: c }) }

  const save = async () => {
    if (!form.name?.trim() || !form.date) return
    const client = { ...form, id: modal.mode === 'add' ? 'h' + Date.now() : modal.client.id, amount: Number(form.amount) || 0 }
    await db.upsert('hair_clients', client)
    setClients(prev => modal.mode === 'add' ? [...prev, client] : prev.map(c => c.id === client.id ? client : c))
    setModal(null)
  }

  const deleteClient = async (id) => {
    await db.delete('hair_clients', id)
    setClients(prev => prev.filter(c => c.id !== id))
  }

  const now = new Date(); now.setHours(0,0,0,0)
  const filtered = clients.filter(c => {
    const d = new Date(c.date)
    if (filter === 'upcoming') return d >= now
    if (filter === 'past') return d < now
    return true
  }).sort((a,b) => new Date(a.date) - new Date(b.date))

  const upcomingCount = clients.filter(c => new Date(c.date) >= now).length
  const totalRevenue = clients.filter(c => new Date(c.date) < now).reduce((acc,c) => acc + (c.amount||0), 0)
  const pendingDeposits = clients.filter(c => new Date(c.date) >= now && !c.deposit_paid).length

  if (loading) return <div style={{ color:'var(--text3)', fontFamily:'JetBrains Mono,monospace', fontSize:12, padding:'40px 0' }}>Loading clients...</div>

  return (
    <div>
      <div className="page-title">💇 Hair Clients</div>
      <div className="page-sub">Track bookings · 2-day reminders · Calendar sync</div>
      <div className="stat-row">
        <div className="stat"><div className="stat-val">{upcomingCount}</div><div className="stat-lbl">Upcoming</div></div>
        <div className="stat"><div className="stat-val">{clients.length}</div><div className="stat-lbl">Total</div></div>
        <div className="stat"><div className="stat-val">{totalRevenue}kr</div><div className="stat-lbl">Earned</div></div>
        <div className="stat"><div className="stat-val" style={{color:pendingDeposits>0?'var(--gold)':'var(--accent2)'}}>{pendingDeposits}</div><div className="stat-lbl">No deposit</div></div>
      </div>

      {clients.filter(c=>{const d=daysUntil(c.date);return d>=0&&d<=2}).map(c=>(
        <div key={c.id} className="warn-card">
          <span>⏰</span>
          <div><strong style={{color:'var(--flame)'}}>{daysUntil(c.date)===0?'TODAY':daysUntil(c.date)===1?'TOMORROW':'IN 2 DAYS'}:</strong> {c.name} — {c.style} — {c.amount}kr
          {!c.deposit_paid&&<span className="deposit-badge deposit-pending" style={{marginLeft:6}}>Deposit pending</span>}</div>
        </div>
      ))}

      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <div className="filters" style={{marginBottom:0}}>
          {['upcoming','past','all'].map(f=>(
            <button key={f} className={'filter-btn'+(filter===f?' active':'')} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd} style={{marginLeft:'auto'}}>+ New booking</button>
      </div>

      {filtered.length===0&&<div style={{color:'var(--text3)',padding:'20px 0',fontFamily:'JetBrains Mono,monospace',fontSize:12}}>No {filter} bookings</div>}
      {filtered.map(c=>{
        const days=daysUntil(c.date)
        const calLink=makeHairClientCalLink(c)
        return(
          <div key={c.id} className="client-card">
            <div className="client-header">
              <div className="client-name">{c.name}</div>
              <div className="client-amount">{c.amount}kr</div>
              {days>=0&&days<=2&&<span className="upcoming-badge">{days===0?'Today!':days===1?'Tomorrow':'In 2 days'}</span>}
            </div>
            <div className="client-details">
              <div className="client-detail"><span className="client-detail-label">Style</span>{c.style}</div>
              <div className="client-detail"><span className="client-detail-label">Date</span>{new Date(c.date).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}</div>
              <div className="client-detail"><span className="client-detail-label">Time</span>{c.start_time}{c.end_time?'–'+c.end_time:''}</div>
              <div className="client-detail"><span className="client-detail-label">Contact</span>{c.contact||'—'}</div>
              {c.notes&&<div className="client-detail" style={{gridColumn:'1/-1'}}><span className="client-detail-label">Notes</span>{c.notes}</div>}
            </div>
            <div className="client-actions">
              <span className={'deposit-badge '+(c.deposit_paid?'deposit-paid':'deposit-pending')}>{c.deposit_paid?'✓ Deposit paid':'⚠ Deposit pending'}</span>
              <a className="cal-btn" href={calLink} target="_blank" rel="noreferrer">📅 Add to Calendar</a>
              <button className="icon-btn" onClick={()=>openEdit(c)}>✏</button>
              <button className="icon-btn del" onClick={()=>deleteClient(c.id)}>🗑</button>
            </div>
          </div>
        )
      })}

      {modal&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal">
            <div className="modal-title">{modal.mode==='add'?'New booking':'Edit booking'}</div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Client name</label><input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name"/></div>
              <div className="form-group"><label className="form-label">Contact</label><input value={form.contact||''} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="Phone / Instagram"/></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Style</label>
                <select value={form.style||STYLES[0]} onChange={e=>setForm({...form,style:e.target.value})}>{STYLES.map(s=><option key={s} value={s}>{s}</option>)}</select>
              </div>
              <div className="form-group"><label className="form-label">Amount (kr)</label><input type="number" value={form.amount||''} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="1200"/></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Date</label><input type="date" value={form.date||''} onChange={e=>setForm({...form,date:e.target.value})}/></div>
              <div className="form-group"><label className="form-label">Deposit paid?</label>
                <div style={{display:'flex',alignItems:'center',gap:10,marginTop:8}}>
                  <input type="checkbox" checked={form.deposit_paid||false} onChange={e=>setForm({...form,deposit_paid:e.target.checked})} style={{width:18,height:18}}/>
                  <span style={{fontSize:13,color:'var(--text2)'}}>Yes, received</span>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Start time</label><input value={form.start_time||''} onChange={e=>setForm({...form,start_time:e.target.value})} placeholder="10:00"/></div>
              <div className="form-group"><label className="form-label">End time</label><input value={form.end_time||''} onChange={e=>setForm({...form,end_time:e.target.value})} placeholder="14:00"/></div>
            </div>
            <div className="form-group"><label className="form-label">Notes</label><textarea value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Hair length, colour, special requests..."/></div>
            <div className="info-card" style={{fontSize:12,color:'var(--text2)',padding:'10px 14px',marginTop:8}}>
              📅 After saving, tap "Add to Calendar" to sync to Google Calendar with a 2-day reminder.
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={save}>Save booking</button>
              <button className="btn btn-ghost" onClick={()=>setModal(null)}>Cancel</button>
              {modal.mode==='edit'&&<button className="btn btn-danger btn-sm" onClick={()=>{deleteClient(modal.client.id);setModal(null)}} style={{marginLeft:'auto'}}>Delete</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
