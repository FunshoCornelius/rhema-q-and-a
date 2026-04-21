export function getPreviousWeekend() {
  const today = new Date()

  // Find previous Sunday
  const prevSunday = new Date(today)
  prevSunday.setDate(today.getDate() - today.getDay())

  // If today is Sunday, getDate() - getDay() yields today, so we subtract 7 to strictly get *past* Sunday
  if (today.getDay() === 0) {
    prevSunday.setDate(today.getDate() - 7)
  }

  // Find prior Saturday
  const prevSaturday = new Date(prevSunday)
  prevSaturday.setDate(prevSunday.getDate() - 1)

  const format = (d: Date) => d.toISOString().split('T')[0]

  return {
    saturday: format(prevSaturday),
    sunday: format(prevSunday),
  }
}
