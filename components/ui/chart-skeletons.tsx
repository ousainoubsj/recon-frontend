// Each skeleton mirrors its real chart's shape (area wave / bars / donut
// ring) using that chart's own color family at reduced opacity, instead of a
// generic gray rectangle — so the loading state already hints at what kind
// of chart is coming. Shared across any card that renders one of these
// ApexCharts types while its data is still loading.

export function AreaChartSkeleton() {
  return (
    <svg viewBox="0 0 300 140" className="h-full w-full animate-pulse" style={{ animationDuration: '1.8s' }} aria-hidden="true">
      <defs>
        <linearGradient id="areaSkeletonFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1="20" x2="300" y2="20" stroke="#232D47" strokeDasharray="4 4" />
      <line x1="0" y1="60" x2="300" y2="60" stroke="#232D47" strokeDasharray="4 4" />
      <line x1="0" y1="100" x2="300" y2="100" stroke="#232D47" strokeDasharray="4 4" />
      <path
        d="M0,90 C 30,60 60,100 90,70 C 120,40 150,80 180,55 C 210,30 240,65 270,45 L300,50 L300,140 L0,140 Z"
        fill="url(#areaSkeletonFill)"
      />
      <path
        d="M0,90 C 30,60 60,100 90,70 C 120,40 150,80 180,55 C 210,30 240,65 270,45 L300,50"
        fill="none"
        stroke="#34D399"
        strokeOpacity="0.55"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {[[0, 90], [90, 70], [180, 55], [270, 45]].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="3.5" fill="#0A1128" stroke="#34D399" strokeOpacity="0.55" strokeWidth="2" />
      ))}
    </svg>
  )
}

export function BarChartSkeleton() {
  const heights = [55, 85, 45, 105, 70, 90]
  const barWidth = 24
  const gap = (300 - heights.length * barWidth) / (heights.length + 1)
  return (
    <svg viewBox="0 0 300 140" className="h-full w-full animate-pulse" style={{ animationDuration: '1.8s' }} aria-hidden="true">
      <line x1="0" y1="20" x2="300" y2="20" stroke="#232D47" strokeDasharray="4 4" />
      <line x1="0" y1="60" x2="300" y2="60" stroke="#232D47" strokeDasharray="4 4" />
      <line x1="0" y1="100" x2="300" y2="100" stroke="#232D47" strokeDasharray="4 4" />
      {heights.map((h, i) => (
        <rect
          key={i}
          x={gap + i * (barWidth + gap)}
          y={130 - h}
          width={barWidth}
          height={h}
          rx="6"
          fill="#2563EB"
          fillOpacity="0.35"
        />
      ))}
    </svg>
  )
}

export function DonutChartSkeleton() {
  const circumference = 2 * Math.PI * 38
  const segments = [
    { color: '#34D399', portion: 0.4 },
    { color: '#6366F1', portion: 0.25 },
    { color: '#3B82F6', portion: 0.2 },
    { color: '#F43F5E', portion: 0.15 },
  ]
  let offset = 0
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full animate-pulse" style={{ animationDuration: '1.8s' }} aria-hidden="true">
      {segments.map(({ color, portion }) => {
        const length = portion * circumference
        const dashoffset = -offset
        offset += length
        return (
          <circle
            key={color}
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke={color}
            strokeOpacity="0.3"
            strokeWidth="14"
            strokeDasharray={`${length} ${circumference}`}
            strokeDashoffset={dashoffset}
            transform="rotate(-90 50 50)"
          />
        )
      })}
    </svg>
  )
}
