interface StatusDotProps {
  status: 'open' | 'closed'
  size?: number
}

export default function StatusDot({ status, size = 8 }: StatusDotProps) {
  return (
    <span
      className={`inline-block rounded-full shrink-0 ${status === 'open' ? 'bg-[#16a34a] status-dot-open' : 'bg-[#cbd5e1]'}`}
      style={{ width: size, height: size }}
    />
  )
}
