import React, { useState, useEffect, useCallback } from 'react'
import { db } from './lib/supabase'
import { themes, applyTheme } from './lib/themes'
import TodayPage from './pages/TodayPage'
import GoalsPage from './pages/GoalsPage'
import ContentPage from './pages/ContentPage'
import HairClientsPage from './pages/HairClientsPage'
import DumpPage from './pages/DumpPage'
import WeekPage from './pages/WeekPage'
import CategoriesPage from './pages/CategoriesPage'

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
    { page: 'content', label: 'LinkedIn', sub: 'linkedin', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 7v4M5 5v.5M8 11V8.5c0-1 .5-1.5 1.5-1.5s1.5.5 1.5 1.5V11"/></svg> },
    { page: 'content', label: 'YouTube', sub: 'youtube', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="14" height="9" rx="2"/><path d="M6.5 7l3 2-3 2V7z" fill="currentColor"/></svg> },
    { page: 'content', label: 'Blog', sub: 'blog', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M3 7h7M3 10h5"/><rect x="1.5" y="1.5" width="13" height="13" rx="2"/></svg> },
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

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const savedCats = localStorage.getItem('h_cats_v3')
    if (savedCats) setCats(JSON.parse(savedCats))
    setLoading(false)
  }, [])

  const saveCats = useCallback((newCats) => {
    setCats(newCats)
    localStorage.setItem('h_cats_v3', JSON.stringify(newCats))
  }, [])

  const handleTheme = (t) => {
    setTheme(t)
    applyTheme(t)
  }

  const handleNav = (p, sub) => {
    setPage(p)
    if (p === 'goals' && sub) setGoalView(sub)
    if (p === 'content' && sub) setContentFilter(sub)
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>Loading...</div>

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-dot" />
          HANNAH
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
        {/* Sidebar */}
        <nav className="sidebar">
          {SIDEBAR.map(group => (
            <div key={group.section}>
              <div className="sidebar-section">{group.section}</div>
              {group.items.map(item => (
                <div
                  key={item.label}
                  className={`sidebar-item${page === item.page && (!item.sub || (item.page === 'goals' && goalView === item.sub) || (item.page === 'content' && contentFilter === item.sub)) ? ' active' : ''}`}
                  onClick={() => handleNav(item.page, item.sub)}
                >
                  {item.icon}
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Pages */}
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
