# Hannah's Planner

A personal productivity app built with React + Supabase.

## Features
- 📋 Daily tasks with Top 3 drag-and-drop, half/done states, calendar sync
- 🎯 Goals organised by Week / Month / Quarter
- 💇 Hair client bookings with 2-day reminders
- 📝 Content pipeline (LinkedIn, YouTube, Blog)
- 🧠 Brain dump with promote-to-task
- 🎨 4 themes: Light, Dark, Peach, Slate
- 📅 Google Calendar sync links on every task

## Setup

### 1. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Set up Supabase (optional — app works offline without it)
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key
4. Create a `.env` file:
\`\`\`
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
\`\`\`
5. Run the SQL in `supabase/schema.sql` in your Supabase SQL editor

### 3. Run locally
\`\`\`bash
npm run dev
\`\`\`

### 4. Deploy to Netlify
\`\`\`bash
npm run build
\`\`\`
Then drag the `dist/` folder to [app.netlify.com/drop](https://app.netlify.com/drop)

Or connect your GitHub repo to Netlify for auto-deploys on every push.

## Without Supabase
The app works fully offline using localStorage. Data stays in your browser.
To sync across devices, deploy to Netlify and add Supabase.
