import { useState, useEffect } from 'react'

export function useCountdown(initialCloseAt: number) {
  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, initialCloseAt - Date.now()),
  )

  useEffect(() => {
    const calcRemaining = () => Math.max(0, initialCloseAt - Date.now())
    setTimeLeft(calcRemaining())

    if (calcRemaining() <= 0) return

    const interval = setInterval(() => {
      const remaining = calcRemaining()
      setTimeLeft(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [initialCloseAt])

  return timeLeft
}
