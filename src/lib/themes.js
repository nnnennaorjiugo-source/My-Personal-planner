export const themes = {
  light: {
    name: 'Light',
    '--bg': '#f5f4f0', '--s1': '#ffffff', '--s2': '#f0eeea', '--s3': '#e8e5df', '--s4': '#dedad2',
    '--border': 'rgba(0,0,0,0.07)', '--border2': 'rgba(0,0,0,0.12)',
    '--text': '#1a1916', '--text2': '#6b6860', '--text3': '#aaa89f',
    '--accent': '#5b4de8', '--accent2': '#00a87a', '--flame': '#e8420a', '--gold': '#c47d00', '--sky': '#0077cc',
    '--shadow': '0 1px 3px rgba(0,0,0,0.08),0 4px 12px rgba(0,0,0,0.04)',
    '--shadow-lg': '0 8px 32px rgba(0,0,0,0.12)',
  },
  dark: {
    name: 'Dark',
    '--bg': '#0a0a0b', '--s1': '#111113', '--s2': '#18181b', '--s3': '#222228', '--s4': '#2c2c35',
    '--border': 'rgba(255,255,255,0.06)', '--border2': 'rgba(255,255,255,0.11)',
    '--text': '#f2f2f0', '--text2': '#888885', '--text3': '#444442',
    '--accent': '#7c6af7', '--accent2': '#00d4a0', '--flame': '#ff5c3a', '--gold': '#f0a500', '--sky': '#3ab8f5',
    '--shadow': '0 1px 3px rgba(0,0,0,0.4)', '--shadow-lg': '0 8px 32px rgba(0,0,0,0.5)',
  },
  peach: {
    name: 'Peach',
    '--bg': '#fff8f4', '--s1': '#ffffff', '--s2': '#fff1eb', '--s3': '#ffe8de', '--s4': '#ffddd0',
    '--border': 'rgba(220,100,60,0.1)', '--border2': 'rgba(220,100,60,0.18)',
    '--text': '#2a1508', '--text2': '#8a5a40', '--text3': '#c4967a',
    '--accent': '#d94f1e', '--accent2': '#2eb87a', '--flame': '#d94f1e', '--gold': '#c47d00', '--sky': '#1a88cc',
    '--shadow': '0 1px 3px rgba(180,80,40,0.1),0 4px 12px rgba(180,80,40,0.05)',
    '--shadow-lg': '0 8px 32px rgba(180,80,40,0.15)',
  },
  slate: {
    name: 'Slate',
    '--bg': '#eef2f7', '--s1': '#ffffff', '--s2': '#e6ecf4', '--s3': '#dae2ee', '--s4': '#cdd7e6',
    '--border': 'rgba(60,90,140,0.1)', '--border2': 'rgba(60,90,140,0.18)',
    '--text': '#0f1c2e', '--text2': '#4a6080', '--text3': '#8aa0bc',
    '--accent': '#2255cc', '--accent2': '#00996a', '--flame': '#cc3311', '--gold': '#aa7700', '--sky': '#0077bb',
    '--shadow': '0 1px 3px rgba(30,60,120,0.08),0 4px 12px rgba(30,60,120,0.05)',
    '--shadow-lg': '0 8px 32px rgba(30,60,120,0.12)',
  },
}

export function applyTheme(themeName) {
  const theme = themes[themeName] || themes.light
  const root = document.documentElement
  Object.entries(theme).forEach(([key, val]) => {
    if (key.startsWith('--')) root.style.setProperty(key, val)
  })
  localStorage.setItem('h_theme', themeName)
}
