// Generates a Google Calendar link to create an event pre-filled
export function makeGCalLink({ title, date, startTime, endTime, description = '' }) {
  const d = date || new Date().toISOString().slice(0, 10)
  const [y, m, day] = d.split('-')
  const fmt = (h, min) => `${y}${m}${day}T${String(h).padStart(2,'0')}${String(min).padStart(2,'0')}00`

  let start, end
  if (startTime) {
    const [sh, sm] = startTime.split(':')
    const [eh, em] = (endTime || startTime).split(':')
    start = fmt(sh, sm)
    end = fmt(eh, em)
  } else {
    start = `${y}${m}${day}`
    end = `${y}${m}${day}`
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: description || 'Added from Hannah\'s Planner',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

// For hair clients — 2-day reminder
export function makeHairClientCalLink(client) {
  const title = `💇 ${client.name} | ${client.style} | ${client.amount}kr`
  const desc = `Style: ${client.style}\nAmount: ${client.amount}kr\nDeposit: ${client.deposit_paid ? 'Paid' : 'Pending'}\nContact: ${client.contact || ''}\nNotes: ${client.notes || ''}`
  return makeGCalLink({
    title,
    date: client.date,
    startTime: client.start_time || '10:00',
    endTime: client.end_time || '14:00',
    description: desc,
  })
}
