interface Props {
  score: number  // 0–10
  verdict: string
}

const VERDICT_COLORS: Record<string, string> = {
  'Great Deal': '#22c55e',
  'Worth It': '#84cc16',
  'Fair Price': '#f59e0b',
  'Overpriced': '#f97316',
  'Skip It': '#ef4444',
}

export default function ValueGauge({ score, verdict }: Props) {
  const color = VERDICT_COLORS[verdict] ?? '#f59e0b'
  const progress = Math.min(1, Math.max(0, score / 10))

  // Half-circle arc: center (100, 100), radius 80
  // M 20 100 A 80 80 0 0 0 180 100  — goes up through (100, 20)
  const r = 80
  const cx = 100
  const cy = 100
  const arcLength = Math.PI * r  // ≈ 251.3
  const filled = arcLength * progress

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width="200"
        height="108"
        viewBox="0 0 200 108"
        role="img"
        aria-label={`Value score: ${score.toFixed(1)} out of 10 — ${verdict}`}
      >
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`}
          fill="none"
          stroke="#e4e4e7"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Progress */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${arcLength}`}
        />
        {/* Score number */}
        <text
          x={cx}
          y={cy - 14}
          textAnchor="middle"
          fontSize="44"
          fontWeight="900"
          fill="#0a0a0a"
          fontFamily="inherit"
        >
          {score.toFixed(1)}
        </text>
        {/* "/ 10" label */}
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          fontSize="12"
          fill="#a1a1aa"
          fontFamily="inherit"
        >
          out of 10
        </text>
      </svg>

      <span
        className="text-xs font-black uppercase tracking-widest px-3 py-1 border-2"
        style={{ color, borderColor: color }}
      >
        {verdict}
      </span>
    </div>
  )
}
