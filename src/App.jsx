import React, { useState, useEffect, useCallback } from 'react'
import { db, isSupabaseReady } from './lib/supabase'
import { themes, applyTheme } from './lib/themes'
import TodayPage from './pages/TodayPage'
import GoalsPage from './pages/GoalsPage'
import HairClientsPage from './pages/HairClientsPage'
import { ContentPage } from './pages/OtherPages'
import { DumpPage } from './pages/OtherPages'
import { WeekPage } from './pages/OtherPages'
import { CategoriesPage } from './pages/OtherPages'

const DEFAULT_CATS = [
  { id: 'c-cert', name: 'Certification', color: '#5b4de8' },
  { id: 'c-k8s', name: 'Kubernetes', color: '#00a87a' },
  { id: 'c-int', name: 'Interview', color: '#c47d00' },
  { id: 'c-job', name: 'Job search', color: '#0077cc' },
  { id: 'c-lab', name: 'Lab / Build', color: '#e8420a' },
  { id: 'c-cnt', name: 'Content', color: '#0077b5' },
  { id: 'c-adm', name: 'Admin', color: '#888885' },
  { id: 'c-wel', name: 'Wellbeing', color: '#c44488' },
  { id: 'c-bbl', name: 'Bible / Prayer', color: '#a06830' },
  { id: 'c-hair', name: 'Hair clients', color: '#e87040' },
]

const PAGES = [
  { id: 'today', label: 'Today' },
  { id: 'goals', label: 'Goals' },
  { id: 'hair', label: '💇 Hair' },
  { id: 'content', label: 'Content' },
  { id: 'dump', label: 'Dump' },
  { id: 'week', label: 'Week' },
  { id: 'cats', label: 'Categories' },
]

const SIDEBAR = [
  { section: 'Daily', items: [
    { page: 'today', label: 'Today + Top 3', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M3 8h10M3 12h6"/></svg> },
    { page: 'week', label: 'This week', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 7h12"/></svg> },
  ]},
  { section: 'Goals', items: [
    { page: 'goals', label: 'Weekly', sub: 'weekly', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 7h12"/></svg> },
    { page: 'goals', label: 'Monthly', sub: 'monthly', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M2 6h12M6 2v4M10 2v4"/></svg> },
    { page: 'goals', label: 'Quarterly', sub: 'quarterly', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="6.5"/></svg> },
  ]},
  { section: 'Clients', items: [
    { page: 'hair', label: 'Hair clients', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2c-2 0-4 1.5-4 4 0 1.5.5 2.5 1.5 3L4 14h8l-1.5-5C11.5 8.5 12 7.5 12 6c0-2.5-2-4-4-4z"/></svg> },
  ]},
  { section: 'Content', items: [
    { page: 'content', label: 'All content', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M3 7h7M3 10h5"/><rect x="1.5" y="1.5" width="13" height="13" rx="2"/></svg> },
  ]},
  { section: 'Other', items: [
    { page: 'dump', label: 'Brain dump', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1a5 5 0 0 1 3 9l-1 1H6l-1-1A5 5 0 0 1 8 1z"/><path d="M6 14h4"/></svg> },
    { page: 'cats', label: 'Categories', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h4v4H2zM10 4h4v4h-4zM2 10h4v4H2zM10 10h4v4h-4z"/></svg> },
  ]},
]

export default function App() {
  const [page, setPage] = useState('today')
  const [goalView, setGoalView] = useState('weekly')
  const [contentFilter, setContentFilter] = useState('all')
  const [theme, setTheme] = useState(() => localStorage.getItem('h_theme') || 'light')
  const [cats, setCats] = useState(DEFAULT_CATS)
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState(null) // null | 'synced' | 'offline'

  useEffect(() => { applyTheme(theme) }, [theme])

  useEffect(() => {
    async function loadCats() {
      try {
        const data = await db.getAll('categories')
        if (data.length > 0) setCats(data)
        setSyncStatus(isSupabaseReady() ? 'synced' : 'offline')
      } catch (e) {
        console.error('Failed to load categories:', e)
        setSyncStatus('offline')
      } finally {
        setLoading(false)
      }
    }
    loadCats()
  }, [])

  const saveCats = useCallback(async (newCats) => {
    setCats(newCats)
    try {
      for (const cat of newCats) await db.upsert('categories', cat)
    } catch (e) { console.error('Save cats error:', e) }
  }, [])

  const handleTheme = (t) => { setTheme(t); applyTheme(t) }
  const handleNav = (p, sub) => {
    setPage(p)
    if (p === 'goals' && sub) setGoalView(sub)
    if (p === 'content' && sub) setContentFilter(sub)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12, color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--s3)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Loading...
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logo-dot" />
          HANNAH
          {syncStatus && (
            <span style={{ fontSize: 9, fontWeight: 500, padding: '2px 6px', borderRadius: 10, background: syncStatus === 'synced' ? 'rgba(0,168,122,0.12)' : 'rgba(196,125,0,0.12)', color: syncStatus === 'synced' ? 'var(--accent2)' : 'var(--gold)', marginLeft: 4 }}>
              {syncStatus === 'synced' ? '☁ synced' : '⚡ offline'}
            </span>
          )}
        </div>
        <div className="nav-tabs">
          {PAGES.map(p => (
            <button key={p.id} className={`nav-tab${page === p.id ? ' active' : ''}`} onClick={() => handleNav(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="theme-switcher">
          {Object.keys(themes).map(t => (
            <div key={t} className={`theme-btn${theme === t ? ' active' : ''}`} data-t={t} onClick={() => handleTheme(t)} title={themes[t].name} />
          ))}
        </div>
      </header>

      <div className="app-body">
        <nav className="sidebar">
          {SIDEBAR.map(group => (
            <div key={group.section}>
              <div className="sidebar-section">{group.section}</div>
              {group.items.map(item => (
                <div
                  key={item.label}
                  className={`sidebar-item${page === item.page && (!item.sub || (page === 'goals' && goalView === item.sub)) ? ' active' : ''}`}
                  onClick={() => handleNav(item.page, item.sub)}
                >
                  {item.icon}{item.label}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <main className="main">
          {page === 'today' && <TodayPage cats={cats} />}
          {page === 'goals' && <GoalsPage cats={cats} initialView={goalView} onViewChange={setGoalView} />}
          {page === 'hair' && <HairClientsPage />}
          {page === 'content' && <ContentPage initialFilter={contentFilter} onFilterChange={setContentFilter} />}
          {page === 'dump' && <DumpPage cats={cats} />}
          {page === 'week' && <WeekPage cats={cats} />}
          {page === 'cats' && <CategoriesPage cats={cats} onSave={saveCats} />}
        </main>
      </div>
    </div>
  )
}
