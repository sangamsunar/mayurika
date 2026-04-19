import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts'

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  bg: '#070710',
  surface: '#0f0f1c',
  card: '#12121f',
  border: 'rgba(201,169,110,0.14)',
  borderHover: 'rgba(201,169,110,0.35)',
  gold: '#c9a96e',
  goldLight: '#e8d5b0',
  goldDim: 'rgba(201,169,110,0.15)',
  text: '#e8d5b0',
  muted: '#6b6b80',
  dim: '#3a3a50',
}

const PALETTE = [
  '#c9a96e', '#7c6fff', '#e84393', '#22c55e',
  '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4', '#a855f7', '#84cc16'
]

const STATUS_COLORS = {
  working: '#3b82f6', finishing: '#8b5cf6', packaging: '#f59e0b',
  transit: '#f97316', ready_for_pickup: '#22c55e',
  delivered: '#10b981', cancelled: '#ef4444'
}
const STATUS_LABELS = {
  working: 'Being Made', finishing: 'Finishing', packaging: 'Packaging',
  transit: 'In Transit', ready_for_pickup: 'Ready for Pickup',
  delivered: 'Delivered', cancelled: 'Cancelled'
}
const PAYMENT_LABELS = {
  esewa: 'eSewa', khalti: 'Khalti', stripe: 'Stripe',
  cod: 'Cash on Delivery', pickup_cash: 'Pickup Cash', unknown: 'Unknown'
}
const DELIVERY_LABELS = { online: 'Online', cod: 'Cash on Delivery', pickup: 'Store Pickup' }
const DELIVERY_COLORS = { online: '#c9a96e', cod: '#7c6fff', pickup: '#22c55e' }

const PRESETS = [
  { label: '7D', days: 7 },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
]

function isoDate(d) { return d.toISOString().slice(0, 10) }
function fmtRs(v) { return `Rs ${(v || 0).toLocaleString()}` }
function fmtK(v) {
  if (v >= 1_000_000) return `Rs ${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `Rs ${(v / 1_000).toFixed(0)}k`
  return `Rs ${v}`
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, prefix = '', suffix = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a1a2e', border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: C.gold }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: C.muted }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>
            {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Pie label ────────────────────────────────────────────────────────────────
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, trend, accentColor = C.gold }) {
  const positive = trend >= 0
  return (
    <div style={{
      background: `linear-gradient(145deg, #13132a 0%, #0c0c1a 100%)`,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHover}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 90, height: 90,
        borderRadius: '50%', background: accentColor, opacity: 0.06, filter: 'blur(24px)'
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 18,
          background: `${accentColor}18`, border: `1px solid ${accentColor}30`
        }}>{icon}</div>
        {trend !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
            background: positive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: positive ? '#22c55e' : '#ef4444',
            border: `1px solid ${positive ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`
          }}>
            {positive ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div style={{ color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          {label}
        </div>
        <div style={{ color: '#fff', fontSize: 24, fontWeight: 800, marginTop: 4, lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accentColor}40, transparent)`
      }} />
    </div>
  )
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({ title, sub, children, span = 1, badge }) {
  return (
    <div style={{
      gridColumn: `span ${span}`,
      background: `linear-gradient(145deg, #13132a 0%, #0c0c1a 100%)`,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: '20px',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>{title}</div>
          {sub && <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>{sub}</div>}
        </div>
        {badge && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
            background: C.goldDim, color: C.gold, border: `1px solid ${C.border}`,
            textTransform: 'uppercase', letterSpacing: 1
          }}>{badge}</span>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Section Divider ──────────────────────────────────────────────────────────
function Section({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 4px' }}>
      <div style={{ width: 3, height: 18, borderRadius: 99, background: C.gold }} />
      <span style={{ color: C.gold, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  )
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────
function StatRow({ label, value, color, pct, total }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: C.text, fontSize: 12, fontWeight: 500 }}>{label}</span>
        <span style={{ color: color || C.gold, fontSize: 12, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: C.dim, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: color || C.gold,
          width: `${Math.min(pct, 100)}%`,
          transition: 'width 1s ease'
        }} />
      </div>
    </div>
  )
}

// ─── Axis helpers ─────────────────────────────────────────────────────────────
const xAxisProps = {
  tick: { fill: C.muted, fontSize: 10 },
  tickLine: false,
  axisLine: false,
}
const yAxisProps = {
  tick: { fill: C.muted, fontSize: 10 },
  tickLine: false,
  axisLine: false,
}
const gridProps = {
  strokeDasharray: '3 3',
  stroke: 'rgba(255,255,255,0.04)',
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminAnalytics() {
  const today = new Date()
  const defaultFrom = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [from, setFrom] = useState(isoDate(defaultFrom))
  const [to, setTo] = useState(isoDate(today))
  const [activePreset, setActivePreset] = useState(2)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnalytics = useCallback(async (f, t) => {
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await axios.get(`/admin/analytics?from=${f}&to=${t}`)
      if (res.error) { setError(res.error); setData(null) }
      else setData(res)
    } catch (e) {
      setError('Failed to fetch analytics')
      console.error(e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAnalytics(from, to) }, [])

  const applyPreset = (idx) => {
    setActivePreset(idx)
    const newFrom = new Date(today.getTime() - PRESETS[idx].days * 24 * 60 * 60 * 1000)
    const f = isoDate(newFrom)
    const t = isoDate(today)
    setFrom(f); setTo(t)
    fetchAnalytics(f, t)
  }

  const applyCustom = () => {
    setActivePreset(null)
    fetchAnalytics(from, to)
  }

  const pct = (curr, prev) => {
    if (!prev) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }

  const s = data?.summary || {}
  const ff = data?.fulfillmentStats || {}

  // ── Compute total revenue across top products for share % ─────
  const topProductsTotal = (data?.topProducts || []).reduce((a, p) => a + p.revenue, 0)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* ── Header + Date Controls ──────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f0f22 0%, #0a0a16 100%)',
        borderBottom: `1px solid ${C.border}`,
        padding: '24px 32px',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
              Analytics Dashboard
            </h2>
            <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 12 }}>
              Jewellery store performance — filtered by date range
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            {/* Preset buttons */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {PRESETS.map((p, i) => (
                <button key={i} onClick={() => applyPreset(i)} style={{
                  padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', border: '1px solid',
                  borderColor: activePreset === i ? C.gold : 'rgba(201,169,110,0.2)',
                  background: activePreset === i ? C.goldDim : 'transparent',
                  color: activePreset === i ? C.gold : C.muted,
                  transition: 'all .15s',
                  letterSpacing: 0.5,
                }}>{p.label}</button>
              ))}
            </div>
            {/* Custom range */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: C.muted, fontSize: 11 }}>From</span>
              <input type="date" value={from} max={to}
                onChange={e => { setFrom(e.target.value); setActivePreset(null) }}
                style={{
                  background: '#1a1a2e', border: `1px solid rgba(201,169,110,0.25)`,
                  borderRadius: 7, padding: '5px 9px', color: C.text,
                  fontSize: 11, outline: 'none', cursor: 'pointer',
                  colorScheme: 'dark',
                }} />
              <span style={{ color: C.muted, fontSize: 11 }}>To</span>
              <input type="date" value={to} min={from} max={isoDate(today)}
                onChange={e => { setTo(e.target.value); setActivePreset(null) }}
                style={{
                  background: '#1a1a2e', border: `1px solid rgba(201,169,110,0.25)`,
                  borderRadius: 7, padding: '5px 9px', color: C.text,
                  fontSize: 11, outline: 'none', cursor: 'pointer',
                  colorScheme: 'dark',
                }} />
              <button onClick={applyCustom} style={{
                background: `linear-gradient(135deg, ${C.gold}, #b8935a)`,
                border: 'none', borderRadius: 7, padding: '6px 14px',
                color: '#07071a', fontWeight: 800, fontSize: 11, cursor: 'pointer',
                letterSpacing: 0.5,
              }}>Apply</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Loading / Error states ────────────────────────────────────── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '100px 40px' }}>
          <div style={{
            width: 48, height: 48, margin: '0 auto 16px',
            border: `3px solid ${C.dim}`,
            borderTopColor: C.gold,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <div style={{ color: C.muted, fontSize: 13 }}>Loading analytics…</div>
        </div>
      )}

      {!loading && error && (
        <div style={{ textAlign: 'center', padding: 80, color: '#ef4444', fontSize: 13 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚠</div>
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ── SECTION: Summary KPIs ─────────────────────────────── */}
          <Section title="Key Metrics" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 14,
          }}>
            <KpiCard icon="💰" label="Total Revenue" value={fmtRs(s.totalRevenue)}
              sub={`prev: ${fmtRs(s.previousRevenue)}`}
              trend={pct(s.totalRevenue, s.previousRevenue)} accentColor={C.gold} />
            <KpiCard icon="🛒" label="Total Orders" value={s.totalOrders}
              sub={`prev: ${s.previousOrders} orders`}
              trend={pct(s.totalOrders, s.previousOrders)} accentColor="#7c6fff" />
            <KpiCard icon="📈" label="Avg Order Value" value={fmtRs(s.avgOrderValue)}
              sub="per completed order" accentColor="#3b82f6" />
            <KpiCard icon="💳" label="Advance Collected" value={fmtRs(s.totalAdvanceCollected)}
              sub="advance paid across orders" accentColor="#22c55e" />
            <KpiCard icon="👥" label="New Customers" value={s.totalUsers}
              sub={`prev: ${s.previousUsers} users`}
              trend={pct(s.totalUsers, s.previousUsers)} accentColor="#e84393" />
            <KpiCard icon="📦" label="Total Products" value={s.totalProducts}
              sub="all active listings" accentColor="#f59e0b" />
          </div>

          {/* ── SECTION: Revenue Trends ───────────────────────────── */}
          <Section title="Revenue & Order Trends" />
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>

            {/* Revenue area */}
            <ChartCard title="Revenue Over Time" sub="Daily revenue across selected period" badge="Area">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.revenueByDay} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.gold} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={C.gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...xAxisProps} tickFormatter={v => v.slice(5)} />
                  <YAxis {...yAxisProps} tickFormatter={fmtK} width={68} />
                  <Tooltip content={<CustomTooltip prefix="Rs " />} />
                  <Area dataKey="revenue" name="Revenue" stroke={C.gold} strokeWidth={2.5}
                    fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: C.gold }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Orders per day */}
            <ChartCard title="Orders Per Day" sub="Daily order volume" badge="Bar">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.ordersByDay} barCategoryGap="40%" margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...xAxisProps} tickFormatter={v => v.slice(5)} />
                  <YAxis {...yAxisProps} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Orders" fill="#7c6fff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Period Comparison chart (full width) ─────────────── */}
          {data.dailyComparison?.length > 0 && (
            <ChartCard title="Current Period vs Previous Period" sub="Revenue comparison aligned by day offset" badge="Comparison">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.dailyComparison} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...xAxisProps} tickFormatter={v => v.slice(5)} />
                  <YAxis {...yAxisProps} tickFormatter={fmtK} width={68} />
                  <Tooltip content={<CustomTooltip prefix="Rs " />} />
                  <Legend wrapperStyle={{ color: C.muted, fontSize: 11, paddingTop: 8 }} />
                  <Line dataKey="revenue" name="This Period" stroke={C.gold} strokeWidth={2.5}
                    dot={false} activeDot={{ r: 5 }} />
                  <Line dataKey="prevRevenue" name="Previous Period" stroke="#7c6fff" strokeWidth={2}
                    strokeDasharray="5 4" dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* ── SECTION: Order Breakdowns ─────────────────────────── */}
          <Section title="Order Breakdowns" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

            {/* Order Status donut */}
            <ChartCard title="Order Status" sub="Current status distribution">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.ordersByStatus} dataKey="count" nameKey="status"
                    cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} labelLine={false} label={renderPieLabel}>
                    {data.ordersByStatus.map((e, i) => (
                      <Cell key={i} fill={STATUS_COLORS[e.status] || PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [v, STATUS_LABELS[n] || n]}
                    contentStyle={{ background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12 }}
                  />
                  <Legend formatter={n => STATUS_LABELS[n] || n}
                    wrapperStyle={{ color: C.muted, fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Payment method donut */}
            <ChartCard title="Payment Methods" sub="How customers paid">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.ordersByPayment} dataKey="count" nameKey="method"
                    cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} labelLine={false} label={renderPieLabel}>
                    {data.ordersByPayment.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [v, PAYMENT_LABELS[n] || n]}
                    contentStyle={{ background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12 }}
                  />
                  <Legend formatter={n => PAYMENT_LABELS[n] || n}
                    wrapperStyle={{ color: C.muted, fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Delivery type donut */}
            <ChartCard title="Delivery Types" sub="Online vs COD vs Pickup">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.ordersByDelivery} dataKey="count" nameKey="type"
                    cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} labelLine={false} label={renderPieLabel}>
                    {data.ordersByDelivery.map((entry, i) => (
                      <Cell key={i} fill={DELIVERY_COLORS[entry.type] || PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [v, DELIVERY_LABELS[n] || n]}
                    contentStyle={{ background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12 }}
                  />
                  <Legend formatter={n => DELIVERY_LABELS[n] || n}
                    wrapperStyle={{ color: C.muted, fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Payment Status + Fulfillment ─────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Payment status (fully paid / advance / pending) */}
            <ChartCard title="Payment Status" sub="Payment completion breakdown">
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={data.paymentStatusData || []} dataKey="count" nameKey="status"
                      cx="50%" cy="50%" innerRadius={48} outerRadius={75}
                      paddingAngle={3} labelLine={false} label={renderPieLabel}>
                      {(data.paymentStatusData || []).map((_, i) => (
                        <Cell key={i} fill={['#22c55e', '#f59e0b', '#ef4444'][i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {(data.paymentStatusData || []).map((d, i) => (
                    <StatRow key={i}
                      label={d.status}
                      value={d.count}
                      color={['#22c55e', '#f59e0b', '#ef4444'][i]}
                      pct={s.totalOrders > 0 ? (d.count / s.totalOrders) * 100 : 0}
                    />
                  ))}
                </div>
              </div>
            </ChartCard>

            {/* Fulfillment stats */}
            <ChartCard title="Fulfillment Metrics" sub="Order lifecycle health">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Cancellation Rate', value: `${ff.cancelRate || 0}%`, color: '#ef4444', icon: '✕' },
                    { label: 'Delivery Rate', value: `${ff.deliveryRate || 0}%`, color: '#22c55e', icon: '✓' },
                    { label: 'Avg Items / Order', value: ff.avgItemsPerOrder || 0, color: '#f59e0b', icon: '📋' },
                    { label: 'Cancelled Orders', value: ff.cancelledCount || 0, color: '#ef4444', icon: '⚠' },
                  ].map((stat, i) => (
                    <div key={i} style={{
                      background: '#0c0c1a', border: `1px solid ${C.border}`,
                      borderRadius: 10, padding: '12px 14px',
                    }}>
                      <div style={{ color: C.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        {stat.icon} {stat.label}
                      </div>
                      <div style={{ color: stat.color, fontSize: 22, fontWeight: 800, marginTop: 4 }}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>

          {/* ── SECTION: Product & Category Insights ─────────────── */}
          <Section title="Product & Category Insights" />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

            {/* Revenue by category */}
            <ChartCard title="Revenue by Category" sub="Total earnings per jewellery type" badge="Horizontal Bar">
              <ResponsiveContainer width="100%" height={Math.max(240, (data.revenueByCategory?.length || 1) * 40 + 40)}>
                <BarChart data={data.revenueByCategory} layout="vertical" barCategoryGap="25%"
                  margin={{ top: 4, right: 20, bottom: 0, left: 4 }}>
                  <CartesianGrid {...gridProps} horizontal={false} />
                  <XAxis type="number" {...xAxisProps} tickFormatter={fmtK} />
                  <YAxis dataKey="category" type="category" {...yAxisProps}
                    tick={{ fill: C.text, fontSize: 11 }} width={72} />
                  <Tooltip content={<CustomTooltip prefix="Rs " />} />
                  <Bar dataKey="revenue" name="Revenue" radius={[0, 6, 6, 0]}>
                    {data.revenueByCategory.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Metal popularity radar */}
            <ChartCard title="Metal Popularity" sub="Items ordered by metal type">
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart cx="50%" cy="50%" outerRadius={80} data={data.metalBreakdown}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="metal" tick={{ fill: C.text, fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} tick={{ fill: C.muted, fontSize: 9 }} />
                  <Radar name="Orders" dataKey="count" stroke={C.gold} fill={C.gold} fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Orders volume by category */}
          <ChartCard title="Category Order Volume" sub="Number of item-level orders per jewellery type">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.revenueByCategory} barCategoryGap="30%"
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="category" {...xAxisProps} />
                <YAxis {...yAxisProps} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" name="Items Ordered" radius={[5, 5, 0, 0]}>
                  {data.revenueByCategory.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ── SECTION: Metal & Purity ───────────────────────────── */}
          <Section title="Metal & Purity Preferences" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Purity breakdown bar */}
            <ChartCard title="Purity Breakdown" sub="Which purity grades customers order most">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={data.purityBreakdown} barCategoryGap="35%"
                  margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="purity" {...xAxisProps} />
                  <YAxis {...yAxisProps} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Items Ordered" radius={[5, 5, 0, 0]}>
                    {(data.purityBreakdown || []).map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Purity revenue */}
            <ChartCard title="Revenue by Purity" sub="Total earnings per purity grade">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={data.purityBreakdown} barCategoryGap="35%"
                  margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="purity" {...xAxisProps} />
                  <YAxis {...yAxisProps} tickFormatter={fmtK} />
                  <Tooltip content={<CustomTooltip prefix="Rs " />} />
                  <Bar dataKey="revenue" name="Revenue" radius={[5, 5, 0, 0]}>
                    {(data.purityBreakdown || []).map((_, i) => (
                      <Cell key={i} fill={PALETTE[(i + 3) % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── SECTION: Payment Revenue ──────────────────────────── */}
          <Section title="Payment Method Analysis" />
          <ChartCard title="Revenue by Payment Method" sub="Count and total revenue per payment gateway" badge="Combined">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={data.revenueByPaymentMethod}
                  margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="method" {...xAxisProps}
                    tickFormatter={m => PAYMENT_LABELS[m] || m} />
                  <YAxis yAxisId="rev" {...yAxisProps} tickFormatter={fmtK} width={64} />
                  <YAxis yAxisId="cnt" orientation="right" {...yAxisProps} allowDecimals={false} />
                  <Tooltip
                    formatter={(v, n) => [n === 'revenue' ? `Rs ${v.toLocaleString()}` : v, n === 'revenue' ? 'Revenue' : 'Orders']}
                    labelFormatter={m => PAYMENT_LABELS[m] || m}
                    contentStyle={{ background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ color: C.muted, fontSize: 11 }} />
                  <Bar yAxisId="rev" dataKey="revenue" name="revenue" fill={C.gold} radius={[5, 5, 0, 0]} opacity={0.85} />
                  <Line yAxisId="cnt" type="monotone" dataKey="count" name="count"
                    stroke="#7c6fff" strokeWidth={2.5} dot={{ fill: '#7c6fff', r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(data.revenueByPaymentMethod || []).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>
                        {PAYMENT_LABELS[p.method] || p.method}
                      </div>
                      <div style={{ fontSize: 10, color: C.muted }}>{p.count} orders</div>
                    </div>
                    <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, flexShrink: 0 }}>
                      {fmtK(p.revenue)}
                    </div>
                  </div>
                ))}
                {(data.revenueByPaymentMethod || []).length === 0 && (
                  <div style={{ color: C.muted, fontSize: 12 }}>No payment data</div>
                )}
              </div>
            </div>
          </ChartCard>

          {/* ── SECTION: Customer Insights ────────────────────────── */}
          <Section title="Customer Insights" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>

            {/* Gender breakdown */}
            {data.ordersByGender?.length > 0 && (
              <ChartCard title="Orders by Gender" sub="Items ordered per gender segment">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.ordersByGender} dataKey="count" nameKey="gender"
                      cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      paddingAngle={4} labelLine={false} label={renderPieLabel}>
                      {data.ordersByGender.map((_, i) => (
                        <Cell key={i} fill={[C.gold, '#7c6fff', '#22c55e'][i % 3]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1a1a2e', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ color: C.muted, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* New user registrations */}
            <ChartCard title="New Customer Registrations" sub="Daily sign-ups across selected period"
              span={data.ordersByGender?.length > 0 ? 1 : 2}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.usersByDay} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e84393" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e84393" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="date" {...xAxisProps} tickFormatter={v => v.slice(5)} />
                  <YAxis {...yAxisProps} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area dataKey="count" name="New Users" stroke="#e84393" strokeWidth={2.5}
                    fill="url(#userGrad)" dot={false} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── SECTION: Top Products ─────────────────────────────── */}
          <Section title="Top Products" />
          <ChartCard title="Top Products by Revenue" sub="Best-performing products in selected range" badge={`Top ${data.topProducts?.length || 0}`}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {['#', 'Product', 'Orders', 'Revenue', 'Share of Top'].map(h => (
                      <th key={h} style={{
                        textAlign: h === '#' || h === 'Orders' || h === 'Revenue' ? 'center' : 'left',
                        padding: '8px 12px', color: C.muted, fontWeight: 700,
                        textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.8,
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data.topProducts || []).map((p, i) => {
                    const share = topProductsTotal > 0 ? ((p.revenue / topProductsTotal) * 100).toFixed(1) : 0
                    return (
                      <tr key={i}
                        style={{ borderBottom: `1px solid rgba(255,255,255,0.03)`, transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '11px 12px', textAlign: 'center', fontWeight: 700, color: C.muted, fontSize: 13 }}>
                          {i < 3 ? ['🥇', '🥈', '🥉'][i] : <span style={{ color: C.dim }}>#{i + 1}</span>}
                        </td>
                        <td style={{ padding: '11px 12px', fontWeight: 600, color: C.text }}>{p.name}</td>
                        <td style={{ padding: '11px 12px', textAlign: 'center', color: C.muted }}>{p.orders}</td>
                        <td style={{ padding: '11px 12px', textAlign: 'center', color: C.gold, fontWeight: 700 }}>
                          Rs {p.revenue.toLocaleString()}
                        </td>
                        <td style={{ padding: '11px 24px 11px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, borderRadius: 99, background: C.dim, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', borderRadius: 99,
                                background: PALETTE[i % PALETTE.length],
                                width: `${share}%`, transition: 'width 1.2s ease'
                              }} />
                            </div>
                            <span style={{ color: C.muted, fontSize: 10, minWidth: 32, textAlign: 'right' }}>{share}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {(!data.topProducts || data.topProducts.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: C.muted }}>
                        No product sales data in this range
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ChartCard>

        </div>
      )}
    </div>
  )
}
