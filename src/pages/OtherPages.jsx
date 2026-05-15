// ContentPage
import React, { useState } from 'react'
export function ContentPage({ initialFilter, onFilterChange }) {
  const platColors = { linkedin: '#0077b5', youtube: '#ff0000', blog: '#00a87a', idea: '#5b4de8' }
  const statusLabels = { idea: '💡 Idea', draft: '✏️ Draft', ready: '✅ Ready', live: '🚀 Live' }
  const statusClasses = { idea: 'status-idea', draft: 'status-draft', ready: 'status-ready', live: 'status-live' }
  const DEFAULT = [
    { id: 'cn1', name: 'My CKA journey — starting from scratch', platform: 'linkedin', status: 'idea', notes: 'Hook: I treated unemployment like a job.' },
    { id: 'cn2', name: 'How I simulate a real DevOps job at home', platform: 'youtube', status: 'idea', notes: 'Show Bebque simulation' },
    { id: 'cn3', name: 'Setting up a K8s home lab', platform: 'blog', status: 'idea', notes: 'minikube + Prometheus + Grafana' },
    { id: 'cn4', name: '5 things I wish I knew before CKA', platform: 'linkedin', status: 'idea', notes: '' },
    { id: 'cn5', name: 'DevOps job hunting in Sweden', platform: 'blog', status: 'idea', notes: 'Real talk about Swedish market' },
  ]
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('h_content_v2') || JSON.stringify(DEFAULT)))
  const [filter, setFilter] = useState(initialFilter || 'all')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const save2 = (c) => { setItems(c); localStorage.setItem('h_content_v2', JSON.stringify(c)) }
  const filtered = filter === 'all' ? items : items.filter(c => c.platform === filter)
  return (
    <div>
      <div className="page-title">Content</div>
      <div className="page-sub">First piece live by May 31 — no exceptions</div>
      <div className="warn-card"><span>🚨</span><div><strong style={{color:'var(--flame)'}}>Deadline:</strong> First piece LIVE by <strong>May 31</strong></div></div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <div className="filters" style={{marginBottom:0}}>
          {['all','linkedin','youtube','blog','idea'].map(f=>(
            <button key={f} className={`filter-btn${filter===f?' active':''}`} onClick={()=>{setFilter(f);onFilterChange?.(f)}}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={()=>{setForm({platform:'linkedin',status:'idea',name:'',notes:''});setModal(true)}} style={{marginLeft:'auto'}}>+ Add</button>
      </div>
      {filtered.map(c=>(
        <div key={c.id} className="content-item">
          <div className="platform-bar" style={{background:platColors[c.platform]||'#888'}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>{c.name}</div>
            <div style={{fontSize:11,display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
              <span style={{color:platColors[c.platform],fontFamily:'JetBrains Mono,monospace',fontSize:10,fontWeight:500}}>{c.platform}</span>
              <span className={`status-pill ${statusClasses[c.status]||''}`}>{statusLabels[c.status]||c.status}</span>
              {c.notes&&<span style={{color:'var(--text3)',fontSize:11}}>{c.notes.slice(0,60)}{c.notes.length>60?'…':''}</span>}
            </div>
          </div>
          <div style={{display:'flex',gap:4}}>
            <button className="icon-btn" onClick={()=>{setForm({...c});setModal('edit_'+c.id)}}>✏</button>
            <button className="icon-btn del" onClick={()=>save2(items.filter(x=>x.id!==c.id))}>🗑</button>
          </div>
        </div>
      ))}
      {modal&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal">
            <div className="modal-title">{modal===true?'Add content':'Edit content'}</div>
            <div className="form-group"><label className="form-label">Title</label><input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Content title or idea"/></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Platform</label>
                <select value={form.platform||'linkedin'} onChange={e=>setForm({...form,platform:e.target.value})}>
                  <option value="linkedin">LinkedIn</option><option value="youtube">YouTube</option><option value="blog">Blog</option><option value="idea">Idea</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Status</label>
                <select value={form.status||'idea'} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="idea">💡 Idea</option><option value="draft">✏️ Draft</option><option value="ready">✅ Ready</option><option value="live">🚀 Live</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Notes</label><textarea value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Hook, key points..."/></div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={()=>{if(!form.name?.trim())return;if(modal===true)save2([...items,{id:'cn'+Date.now(),...form}]);else save2(items.map(c=>c.id===form.id?{...c,...form}:c));setModal(null)}}>Save</button>
              <button className="btn btn-ghost" onClick={()=>setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// DumpPage
export function DumpPage({ cats }) {
  const dumpColors = {task:'#0077cc',idea:'#5b4de8',goal:'#c47d00',content:'#0077b5',other:'#888'}
  const DEFAULT = [{id:'d1',text:'Build a trading bot using Python + DevOps skills',cat:'idea'},{id:'d2',text:'Research Toptal for freelance DevOps',cat:'task'},{id:'d3',text:'GRE vocab: 20 words a day starting June',cat:'goal'}]
  const [items, setItems] = useState(()=>JSON.parse(localStorage.getItem('h_dump_v2')||JSON.stringify(DEFAULT)))
  const [filter, setFilter] = useState('all')
  const [text, setText] = useState('')
  const [cat, setCat] = useState('task')
  const save2=(d)=>{setItems(d);localStorage.setItem('h_dump_v2',JSON.stringify(d))}
  const add=()=>{if(!text.trim())return;save2([...items,{id:'d'+Date.now(),text,cat}]);setText('')}
  const promote=(id)=>{const d=items.find(d=>d.id===id);if(!d)return;const tasks=JSON.parse(localStorage.getItem('h_tasks_v4')||'[]');localStorage.setItem('h_tasks_v4',JSON.stringify([...tasks,{id:'t'+Date.now(),name:d.text,tier:'should',cat:'c-adm',weight:8,priority:0,startTime:'',endTime:''}]));save2(items.filter(x=>x.id!==id));alert('Added to Should do tasks!')}
  const filtered=filter==='all'?items:items.filter(d=>d.cat===filter)
  return(
    <div>
      <div className="page-title">Brain dump</div>
      <div className="page-sub">Capture everything — sort later</div>
      <div className="card" style={{marginBottom:14}}>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Type anything — idea, task, worry, goal. Ctrl+Enter to save." onKeyDown={e=>{if(e.key==='Enter'&&e.ctrlKey)add()}} style={{marginBottom:10}}/>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <select value={cat} onChange={e=>setCat(e.target.value)} style={{width:130,fontSize:12,padding:'7px 10px'}}>
            <option value="task">Task</option><option value="idea">Idea</option><option value="goal">Goal</option><option value="content">Content</option><option value="other">Other</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={add}>Capture →</button>
        </div>
      </div>
      <div className="filters">
        {['all','task','idea','goal','content'].map(f=>(
          <button key={f} className={`filter-btn${filter===f?' active':''}`} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
        ))}
      </div>
      {filtered.map(d=>(
        <div key={d.id} className="dump-card">
          <div style={{width:8,height:8,borderRadius:'50%',background:dumpColors[d.cat]||'#888',flexShrink:0,marginTop:5}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,color:'var(--text2)',lineHeight:1.5}}>{d.text}</div>
            <div style={{fontSize:10,color:'var(--text3)',marginTop:3,fontFamily:'JetBrains Mono,monospace'}}>{d.cat}</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            <button className="promote-btn" onClick={()=>promote(d.id)}>→ task</button>
            <button className="promote-btn" onClick={()=>save2(items.filter(x=>x.id!==d.id))} style={{color:'var(--flame)'}}>✕</button>
          </div>
        </div>
      ))}
      {filtered.length===0&&<div style={{color:'var(--text3)',padding:'16px 0',fontSize:12,fontFamily:'JetBrains Mono,monospace'}}>Nothing yet — start capturing!</div>}
    </div>
  )
}

// WeekPage
export function WeekPage({ cats }) {
  const getWeekNum=(d=new Date())=>{const s=new Date(d.getFullYear(),0,1);return Math.ceil(((d-s)/86400000+s.getDay()+1)/7)}
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const dates=[15,16,17,18,19,20,21]
  const td=new Date().getDate()
  const weekScores=JSON.parse(localStorage.getItem('h_ws4')||'{}')
  const goals=JSON.parse(localStorage.getItem('h_goals_v3')||'[]')
  const wn=getWeekNum()
  const wg=goals.filter(g=>g.term==='weekly'&&g.period===`Week ${wn}`).sort((a,b)=>(a.priority||9)-(b.priority||9))
  const done=wg.filter(g=>g.done).length
  const getCat=(id)=>cats.find(c=>c.id===id)||{name:'Other',color:'#888'}
  const priColors={1:'var(--flame)',2:'var(--gold)',3:'var(--accent2)'}
  const toggleGoal=(id)=>{const updated=goals.map(g=>g.id===id?{...g,done:!g.done}:g);localStorage.setItem('h_goals_v3',JSON.stringify(updated))}
  return(
    <div>
      <div className="page-title">This week</div>
      <div className="page-sub">Week {wn} · May 15–21, 2026</div>
      <div className="week-strip">
        {days.map((d,i)=>(
          <div key={d} className={`week-day${dates[i]===td?' today':''}`}>
            <div className="wday-name">{d}</div>
            <div className="wday-num">{dates[i]}</div>
            <div style={{fontSize:10,fontFamily:'JetBrains Mono,monospace',color:'var(--text3)',marginTop:4}}>{weekScores[d]?weekScores[d]+'%':''}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
        <div style={{fontSize:11,fontFamily:'JetBrains Mono,monospace',color:'var(--text2)',textTransform:'uppercase',letterSpacing:'0.08em',flex:1,fontWeight:500}}>Week {wn} goals</div>
        <div style={{fontSize:10,fontFamily:'JetBrains Mono,monospace',color:'var(--text3)',background:'var(--s3)',padding:'2px 8px',borderRadius:10}}>{done}/{wg.length}</div>
      </div>
      {wg.map(g=>(
        <div key={g.id} className="goal-card">
          <div className="priority-dot" style={{background:priColors[g.priority]||'var(--text3)'}}/>
          <div className={`goal-check${g.done?' done':''}`} onClick={()=>{toggleGoal(g.id);window.location.reload()}}>{g.done?'✓':''}</div>
          <div style={{flex:1}}>
            <div className={`goal-name${g.done?' done':''}`}>{g.name}</div>
            {g.deadline&&<div className="goal-meta">📅 {g.deadline}</div>}
          </div>
        </div>
      ))}
      {wg.length===0&&<div style={{color:'var(--text3)',fontSize:12,padding:'10px 0',fontFamily:'JetBrains Mono,monospace'}}>No goals for Week {wn} yet — add them in Goals page</div>}
    </div>
  )
}

// CategoriesPage
export function CategoriesPage({ cats, onSave }) {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const openAdd=()=>{setForm({name:'',color:'#5b4de8'});setModal({mode:'add'})}
  const openEdit=(c)=>{setForm({...c});setModal({mode:'edit',cat:c})}
  const save=()=>{
    if(!form.name?.trim())return
    if(modal.mode==='add')onSave([...cats,{id:'cat'+Date.now(),name:form.name,color:form.color}])
    else onSave(cats.map(c=>c.id===modal.cat.id?{...c,...form}:c))
    setModal(null)
  }
  const del=(id)=>{if(confirm('Delete this category? Tasks using it will show as Other.'))onSave(cats.filter(c=>c.id!==id))}
  return(
    <div>
      <div className="page-title">Categories</div>
      <div className="page-sub">Manage task and goal categories</div>
      <div className="cat-grid">
        {cats.map(c=>(
          <div key={c.id} className="cat-chip">
            <div className="cat-dot" style={{background:c.color}}/>
            <div style={{flex:1,fontSize:13,fontWeight:600}}>{c.name}</div>
            <button className="icon-btn" onClick={()=>openEdit(c)} style={{width:22,height:22,fontSize:11}}>✏</button>
            <button className="icon-btn del" onClick={()=>del(c.id)} style={{width:22,height:22,fontSize:11}}>✕</button>
          </div>
        ))}
      </div>
      <button className="btn btn-ghost btn-sm" onClick={openAdd}>+ New category</button>
      {modal&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal">
            <div className="modal-title">{modal.mode==='add'?'Add category':'Edit category'}</div>
            <div className="form-group"><label className="form-label">Name</label><input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Kubernetes"/></div>
            <div className="form-group"><label className="form-label">Colour</label><input type="color" value={form.color||'#5b4de8'} onChange={e=>setForm({...form,color:e.target.value})}/></div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={save}>Save</button>
              <button className="btn btn-ghost" onClick={()=>setModal(null)}>Cancel</button>
              {modal.mode==='edit'&&<button className="btn btn-danger btn-sm" onClick={()=>{del(modal.cat.id);setModal(null)}} style={{marginLeft:'auto'}}>Delete</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
