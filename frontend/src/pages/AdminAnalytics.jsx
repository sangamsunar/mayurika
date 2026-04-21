import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  CurrencyIcon, ShoppingCartIcon, TrendingUpIcon, CreditCardIcon,
  UsersIcon, BoxIcon, TruckIcon, BanIcon, ClipboardListIcon, ZapIcon,
  AlertTriangleIcon, TrophyIcon,
} from '../components/Icons'

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:          '#04040A',
  surface:     '#08080F',
  card:        '#0E0E18',
  card2:       '#141420',
  border:      'rgba(255,255,255,0.06)',
  borderGold:  'rgba(201,169,110,0.2)',
  gold:        '#C9A96E',
  goldLight:   '#E8D4A0',
  teal:        '#2DD4BF',
  plum:        '#A78BFA',
  rose:        '#F472B6',
  blue:        '#60A5FA',
  green:       '#34D399',
  text:        '#F0EBE1',
  muted:       'rgba(240,235,225,0.45)',
  dim:         'rgba(240,235,225,0.22)',
  dimBg:       'rgba(255,255,255,0.04)',
}

const PALETTE = [
  '#C9A96E', '#2DD4BF', '#A78BFA', '#F472B6',
  '#60A5FA', '#34D399', '#FB923C', '#818CF8',
  '#E879F9', '#4ADE80',
]

const STATUS_COLORS = {
  working:          '#60A5FA',
  finishing:        '#A78BFA',
  packaging:        '#FCD34D',
  transit:          '#FB923C',
  ready_for_pickup: '#34D399',
  delivered:        '#C9A96E',
  cancelled:        '#F87171',
}
const STATUS_LABELS = {
  working: 'Being Made', finishing: 'Finishing', packaging: 'Packaging',
  transit: 'In Transit', ready_for_pickup: 'Ready for Pickup',
  delivered: 'Delivered', cancelled: 'Cancelled',
}
const PAYMENT_LABELS  = { esewa: 'eSewa', khalti: 'Khalti', stripe: 'Stripe', cod: 'Cash on Delivery', pickup_cash: 'Pickup Cash', unknown: 'Unknown' }
const DELIVERY_COLORS = { online: '#C9A96E', cod: '#A78BFA', pickup: '#2DD4BF' }
const DELIVERY_LABELS = { online: 'Online', cod: 'COD', pickup: 'Pickup' }

const PRESETS = [
  { label: '7D', days: 7 }, { label: '14D', days: 14 }, { label: '30D', days: 30 },
  { label: '90D', days: 90 }, { label: '6M', days: 180 }, { label: '1Y', days: 365 },
]

const isoDate = d => d.toISOString().slice(0, 10)
const fmtRs   = v => `Rs ${(v || 0).toLocaleString()}`
const fmtK    = v => {
  if (v >= 1_000_000) return `Rs ${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `Rs ${(v / 1_000).toFixed(0)}k`
  return `Rs ${v}`
}

// ── Shared chart config ───────────────────────────────────────────────────────
const TOOLTIP_STYLE = {
  background: '#0E0E18',
  border: `1px solid rgba(201,169,110,0.2)`,
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 12,
  color: T.text,
  boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
}
const xAxis = { tick: { fill: T.dim, fontSize: 10 }, tickLine: false, axisLine: false }
const yAxis = { tick: { fill: T.dim, fontSize: 10 }, tickLine: false, axisLine: false }
const grid  = { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.04)' }

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function DarkTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !payload?.length) return null
  return (
    <div style={TOOLTIP_STYLE}>
      <div style={{ fontWeight: 700, marginBottom: 8, color: T.gold, fontSize: 11 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: 'rgba(240,235,225,0.72)', fontSize: 11 }}>{p.name}:</span>
          <span style={{ fontWeight: 700, fontSize: 12, color: T.text }}>
            {valueFormatter ? valueFormatter(p.value) : typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Pie label ─────────────────────────────────────────────────────────────────
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null
  const R = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * R)
  const y = cy + r * Math.sin(-midAngle * R)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, trend, accent = T.gold }) {
  const positive = trend >= 0
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      padding: '22px 24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color .2s, transform .2s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}45`; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'translateY(0)' }}>

      {/* Corner glow */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: accent, opacity: 0.06, filter: 'blur(30px)', pointerEvents: 'none' }} />
      {/* Bottom accent bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}55, transparent)` }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${accent}14`, border: `1px solid ${accent}28`, color: accent }}>
          <Icon size={18} strokeWidth={1.6} />
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '4px 9px', borderRadius: 999,
            background: positive ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
            color: positive ? '#34D399' : '#F87171',
            border: `1px solid ${positive ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
          }}>
            {positive ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div style={{ color: T.dim, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>{label}</div>
      <div style={{ color: T.text, fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: T.muted, fontSize: 11, marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

// ── Chart Card ────────────────────────────────────────────────────────────────
function Card({ title, sub, children, badge, fullWidth }) {
  return (
    <div style={{
      gridColumn: fullWidth ? '1 / -1' : undefined,
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      padding: '24px',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div style={{ color: T.text, fontSize: 15, fontWeight: 700 }}>{title}</div>
          {sub && <div style={{ color: T.muted, fontSize: 12, marginTop: 3 }}>{sub}</div>}
        </div>
        {badge && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 9px', borderRadius: 999, background: 'rgba(201,169,110,0.1)', color: T.gold, border: `1px solid ${T.borderGold}`, textTransform: 'uppercase', letterSpacing: 1 }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ title }) {
  return (
    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
      <div style={{ width: 3, height: 16, borderRadius: 99, background: `linear-gradient(to bottom, ${T.gold}, ${T.teal})` }} />
      <span style={{ color: T.gold, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  )
}

// ── Stat bar row ──────────────────────────────────────────────────────────────
function StatBar({ label, value, color, pct }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ color: T.text, fontSize: 12 }}>{label}</span>
        <span style={{ color: color || T.gold, fontSize: 12, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: color || T.gold, width: `${Math.min(pct || 0, 100)}%`, transition: 'width 1.2s ease' }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminAnalytics() {
  const today = new Date()
  const defaultFrom = new Date(today.getTime() - 30 * 86400_000)

  const [from, setFrom]               = useState(isoDate(defaultFrom))
  const [to, setTo]                   = useState(isoDate(today))
  const [activePreset, setActivePreset] = useState(2)
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  const fetchAnalytics = useCallback(async (f, t) => {
    setLoading(true); setError(null)
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

  const applyPreset = idx => {
    setActivePreset(idx)
    const f = isoDate(new Date(today.getTime() - PRESETS[idx].days * 86400_000))
    const t = isoDate(today)
    setFrom(f); setTo(t); fetchAnalytics(f, t)
  }

  const pct = (curr, prev) => {
    if (!prev) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }

  const s  = data?.summary || {}
  const ff = data?.fulfillmentStats || {}
  const topTotal = (data?.topProducts || []).reduce((a, p) => a + p.revenue, 0)

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', background: T.bg, gap: 16 }}>
      <div style={{ width: 48, height: 48, border: `3px solid rgba(255,255,255,0.07)`, borderTopColor: T.gold, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ color: T.muted, fontSize: 13 }}>Loading analytics…</div>
    </div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#F87171', background: T.bg }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <AlertTriangleIcon size={40} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: 14 }}>{error}</div>
    </div>
  )

  if (!data) return null

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: "'DM Sans','Inter',system-ui,sans-serif", minHeight: '100vh' }}>

      {/* ── Date Controls ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(8,8,15,0.97)',
        borderBottom: `1px solid ${T.border}`,
        padding: '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 14,
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(16px)',
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: -0.5 }}>Analytics</div>
          <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>Store performance by date range</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          {/* Presets */}
          <div style={{ display: 'flex', gap: 4 }}>
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => applyPreset(i)} style={{
                padding: '5px 13px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                border: `1px solid ${activePreset === i ? T.gold : 'rgba(201,169,110,0.18)'}`,
                background: activePreset === i ? 'rgba(201,169,110,0.12)' : 'transparent',
                color: activePreset === i ? T.gold : T.muted,
                transition: 'all .15s',
              }}>{p.label}</button>
            ))}
          </div>
          {/* Custom range */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {['From', 'To'].map((lbl, idx) => (
              <>
                <span key={`lbl-${idx}`} style={{ color: T.dim, fontSize: 11 }}>{lbl}</span>
                <input key={`inp-${idx}`} type="date"
                  value={idx === 0 ? from : to}
                  max={idx === 0 ? to : isoDate(today)}
                  min={idx === 1 ? from : undefined}
                  onChange={e => { idx === 0 ? setFrom(e.target.value) : setTo(e.target.value); setActivePreset(null) }}
                  style={{ background: T.card2, border: `1px solid rgba(201,169,110,0.22)`, borderRadius: 8, padding: '5px 10px', color: T.text, fontSize: 11, outline: 'none', colorScheme: 'dark', cursor: 'pointer' }} />
              </>
            ))}
            <button onClick={() => { setActivePreset(null); fetchAnalytics(from, to) }} style={{
              background: `linear-gradient(135deg, ${T.gold}, #b8935a)`,
              border: 'none', borderRadius: 8, padding: '6px 16px',
              color: '#04040A', fontWeight: 800, fontSize: 11, cursor: 'pointer',
            }}>Apply</button>
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>

        {/* ── KPIs ─────────────────────────────────────────────────────────── */}
        <SectionLabel title="Key Metrics" />

        <KpiCard icon={CurrencyIcon}     label="Total Revenue"     value={fmtRs(s.totalRevenue)}          sub={`prev: ${fmtRs(s.previousRevenue)}`}      trend={pct(s.totalRevenue, s.previousRevenue)}  accent={T.gold}  />
        <KpiCard icon={ShoppingCartIcon}  label="Total Orders"      value={s.totalOrders ?? 0}             sub={`prev: ${s.previousOrders ?? 0} orders`}   trend={pct(s.totalOrders, s.previousOrders)}    accent={T.teal}  />
        <KpiCard icon={TrendingUpIcon}    label="Avg Order Value"   value={fmtRs(s.avgOrderValue)}         sub="per completed order"                                                                        accent={T.blue}  />
        <KpiCard icon={CreditCardIcon}    label="Advance Collected" value={fmtRs(s.totalAdvanceCollected)} sub="across all orders"                                                                           accent={T.green} />
        <KpiCard icon={UsersIcon}         label="New Customers"     value={s.totalUsers ?? 0}              sub={`prev: ${s.previousUsers ?? 0} users`}     trend={pct(s.totalUsers, s.previousUsers)}      accent={T.rose}  />
        <KpiCard icon={BoxIcon}           label="Total Products"    value={s.totalProducts ?? 0}           sub="active listings"                                                                             accent={T.plum}  />
        <KpiCard icon={TruckIcon}         label="Delivery Rate"     value={`${ff.deliveryRate || 0}%`}     sub="of all orders delivered"                                                                      accent={T.green} />
        <KpiCard icon={BanIcon}           label="Cancellation Rate" value={`${ff.cancelRate || 0}%`}       sub={`${ff.cancelledCount || 0} cancelled`}                                                        accent="#F87171" />

        {/* ── Revenue Trends ───────────────────────────────────────────────── */}
        <SectionLabel title="Revenue & Orders Over Time" />

        {/* Revenue area — full width */}
        <Card title="Revenue Over Time" sub="Daily earnings across selected period" badge="Area" fullWidth>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data.revenueByDay} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.gold} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={T.gold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...grid} />
              <XAxis dataKey="date" {...xAxis} tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
              <YAxis {...yAxis} tickFormatter={fmtK} width={72} />
              <Tooltip content={<DarkTooltip valueFormatter={v => fmtRs(v)} />} />
              <Area dataKey="revenue" name="Revenue" stroke={T.gold} strokeWidth={2.5}
                fill="url(#revGrad)" dot={false} activeDot={{ r: 6, fill: T.gold, stroke: '#0E0E18', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Orders per day — 2 col */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card title="Orders Per Day" sub="Daily order volume" badge="Bar">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.ordersByDay} barCategoryGap="45%" margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="date" {...xAxis} tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                <YAxis {...yAxis} allowDecimals={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="count" name="Orders" fill={T.teal} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Period comparison — 2 col */}
        {data.dailyComparison?.length > 0 && (
          <div style={{ gridColumn: 'span 2' }}>
            <Card title="This Period vs Last Period" sub="Revenue aligned by day offset" badge="Compare">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.dailyComparison} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid {...grid} />
                  <XAxis dataKey="date" {...xAxis} tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                  <YAxis {...yAxis} tickFormatter={fmtK} width={72} />
                  <Tooltip content={<DarkTooltip valueFormatter={v => fmtRs(v)} />} />
                  <Legend wrapperStyle={{ color: T.muted, fontSize: 11, paddingTop: 8 }} />
                  <Line dataKey="revenue"     name="This Period"     stroke={T.gold}  strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                  <Line dataKey="prevRevenue" name="Previous Period" stroke={T.plum}  strokeWidth={2} strokeDasharray="5 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* ── Order Breakdowns ─────────────────────────────────────────────── */}
        <SectionLabel title="Order Breakdowns" />

        {/* Status donut — large */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card title="Order Status Distribution" sub="Current breakdown of all orders">
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie data={data.ordersByStatus} dataKey="count" nameKey="status"
                    cx="50%" cy="50%" innerRadius={65} outerRadius={100}
                    paddingAngle={3} labelLine={false} label={PieLabel}>
                    {data.ordersByStatus.map((e, i) => (
                      <Cell key={i} fill={STATUS_COLORS[e.status] || PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, STATUS_LABELS[n] || n]} contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, minWidth: 0 }}>
                {data.ordersByStatus.map((e, i) => (
                  <StatBar
                    key={i}
                    label={STATUS_LABELS[e.status] || e.status}
                    value={e.count}
                    color={STATUS_COLORS[e.status] || PALETTE[i % PALETTE.length]}
                    pct={s.totalOrders > 0 ? (e.count / s.totalOrders) * 100 : 0}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Payment method donut */}
        <Card title="Payment Methods" sub="How customers paid">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.ordersByPayment} dataKey="count" nameKey="method"
                cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                paddingAngle={3} labelLine={false} label={PieLabel}>
                {data.ordersByPayment.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, PAYMENT_LABELS[n] || n]} contentStyle={TOOLTIP_STYLE} />
              <Legend formatter={n => PAYMENT_LABELS[n] || n} wrapperStyle={{ color: T.muted, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Delivery type donut */}
        <Card title="Delivery Types" sub="Online vs COD vs Pickup">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.ordersByDelivery} dataKey="count" nameKey="type"
                cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                paddingAngle={3} labelLine={false} label={PieLabel}>
                {data.ordersByDelivery.map((e, i) => (
                  <Cell key={i} fill={DELIVERY_COLORS[e.type] || PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, DELIVERY_LABELS[n] || n]} contentStyle={TOOLTIP_STYLE} />
              <Legend formatter={n => DELIVERY_LABELS[n] || n} wrapperStyle={{ color: T.muted, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Fulfillment mini-stats ─────────────────────────────────────── */}
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { Icon: ClipboardListIcon, label: 'Avg Items / Order', value: ff.avgItemsPerOrder || 0, accent: T.gold },
            { Icon: TruckIcon,         label: 'Delivered',          value: ff.deliveryRate ? `${ff.deliveryRate}%` : '—', accent: T.green },
            { Icon: BanIcon,           label: 'Cancelled',          value: ff.cancelledCount || 0, accent: '#F87171' },
            { Icon: ZapIcon,           label: 'Cancel Rate',         value: ff.cancelRate ? `${ff.cancelRate}%` : '—', accent: '#FB923C' },
          ].map((stat, i) => (
            <div key={i} style={{ background: T.card2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: T.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                <stat.Icon size={13} strokeWidth={1.8} />
                {stat.label}
              </div>
              <div style={{ color: stat.accent, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* ── Product & Category Insights ─────────────────────────────────── */}
        <SectionLabel title="Product & Category Insights" />

        {/* Revenue by category — full width horizontal bar */}
        <Card title="Revenue by Category" sub="Total earnings per jewellery type" badge="Horizontal Bar" fullWidth>
          <ResponsiveContainer width="100%" height={Math.max(280, (data.revenueByCategory?.length || 1) * 46 + 40)}>
            <BarChart data={data.revenueByCategory} layout="vertical" barCategoryGap="30%"
              margin={{ top: 4, right: 20, bottom: 0, left: 8 }}>
              <CartesianGrid {...grid} horizontal={false} />
              <XAxis type="number" {...xAxis} tickFormatter={fmtK} />
              <YAxis dataKey="category" type="category" tick={{ fill: T.text, fontSize: 12 }} width={82} tickLine={false} axisLine={false} />
              <Tooltip content={<DarkTooltip valueFormatter={v => fmtRs(v)} />} />
              <Bar dataKey="revenue" name="Revenue" radius={[0, 7, 7, 0]}>
                {data.revenueByCategory.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Category order volume */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card title="Order Volume by Category" sub="Items ordered per jewellery type">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.revenueByCategory} barCategoryGap="35%"
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="category" {...xAxis} />
                <YAxis {...yAxis} allowDecimals={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="orders" name="Items Ordered" radius={[6, 6, 0, 0]}>
                  {data.revenueByCategory.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Metal popularity — full width horizontal bar */}
        <Card title="Metal Popularity" sub="Order volume split by metal type" badge="Bar" fullWidth>
          <div style={{ display: 'flex', gap: 32, alignItems: 'stretch' }}>
            {/* Bar chart */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.metalBreakdown} layout="vertical" barCategoryGap="35%"
                  margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
                  <CartesianGrid {...grid} horizontal={false} />
                  <XAxis type="number" {...xAxis} allowDecimals={false} />
                  <YAxis dataKey="metal" type="category"
                    tick={{ fill: T.text, fontSize: 13, fontWeight: 600 }}
                    width={60} tickLine={false} axisLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="count" name="Orders" radius={[0, 8, 8, 0]}>
                    {(data.metalBreakdown || []).map((entry, i) => (
                      <Cell key={i} fill={entry.metal === 'gold' ? T.gold : T.blue} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Stat cards per metal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', minWidth: 200 }}>
              {(data.metalBreakdown || []).map((entry, i) => {
                const color = entry.metal === 'gold' ? T.gold : T.blue
                const total = (data.metalBreakdown || []).reduce((a, e) => a + e.count, 0)
                const share = total > 0 ? Math.round((entry.count / total) * 100) : 0
                return (
                  <div key={i} style={{
                    background: `${color}0D`,
                    border: `1px solid ${color}28`,
                    borderRadius: 12, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div>
                      <div style={{ color: T.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
                        {entry.metal}
                      </div>
                      <div style={{ color: color, fontWeight: 800, fontSize: 22, lineHeight: 1 }}>{entry.count}</div>
                      <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{share}% of orders</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* ── Metal & Purity ───────────────────────────────────────────────── */}
        <SectionLabel title="Metal & Purity Preferences" />

        <div style={{ gridColumn: 'span 2' }}>
          <Card title="Purity Breakdown" sub="Which purity grades are ordered most">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.purityBreakdown} barCategoryGap="40%"
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="purity" {...xAxis} />
                <YAxis {...yAxis} allowDecimals={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="count" name="Items" radius={[6, 6, 0, 0]}>
                  {(data.purityBreakdown || []).map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <Card title="Revenue by Purity" sub="Earnings per purity grade">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.purityBreakdown} barCategoryGap="40%"
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="purity" {...xAxis} />
                <YAxis {...yAxis} tickFormatter={fmtK} />
                <Tooltip content={<DarkTooltip valueFormatter={v => fmtRs(v)} />} />
                <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                  {(data.purityBreakdown || []).map((_, i) => (
                    <Cell key={i} fill={PALETTE[(i + 3) % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Customer Insights ────────────────────────────────────────────── */}
        <SectionLabel title="Customer Insights" />

        {/* New registrations — 3 col */}
        <div style={{ gridColumn: 'span 3' }}>
          <Card title="New Customer Registrations" sub="Daily sign-ups in selected period">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.usersByDay} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={T.rose} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={T.rose} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...grid} />
                <XAxis dataKey="date" {...xAxis} tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
                <YAxis {...yAxis} allowDecimals={false} />
                <Tooltip content={<DarkTooltip />} />
                <Area dataKey="count" name="New Users" stroke={T.rose} strokeWidth={2.5}
                  fill="url(#userGrad)" dot={false} activeDot={{ r: 6, fill: T.rose, stroke: '#0E0E18', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Gender donut — 1 col */}
        {data.ordersByGender?.length > 0 && (
          <Card title="Orders by Gender" sub="Items per gender segment">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.ordersByGender} dataKey="count" nameKey="gender"
                  cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={4} labelLine={false} label={PieLabel}>
                  {data.ordersByGender.map((_, i) => (
                    <Cell key={i} fill={[T.rose, T.blue, T.teal][i % 3]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: T.muted, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Payment method analysis — full width */}
        <SectionLabel title="Payment Method Analysis" />
        <Card title="Revenue & Volume by Payment Method" sub="Earnings and order count per gateway" badge="Combined" fullWidth>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.revenueByPaymentMethod} barCategoryGap="40%"
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="method" {...xAxis} tickFormatter={m => PAYMENT_LABELS[m] || m} />
                <YAxis {...yAxis} tickFormatter={fmtK} />
                <Tooltip
                  formatter={(v, n) => [n === 'revenue' ? fmtRs(v) : v, n === 'revenue' ? 'Revenue' : 'Orders']}
                  labelFormatter={m => PAYMENT_LABELS[m] || m}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Legend wrapperStyle={{ color: T.muted, fontSize: 11 }} />
                <Bar dataKey="revenue" name="Revenue" fill={T.gold} radius={[6, 6, 0, 0]}>
                  {(data.revenueByPaymentMethod || []).map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
              {(data.revenueByPaymentMethod || []).map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{PAYMENT_LABELS[p.method] || p.method}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{p.count} orders</div>
                  </div>
                  <div style={{ fontSize: 12, color: T.gold, fontWeight: 700 }}>{fmtK(p.revenue)}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Top Products ─────────────────────────────────────────────────── */}
        <SectionLabel title="Top Products" />
        <Card title="Best Performing Products" sub="Ranked by revenue in selected period"
          badge={`Top ${data.topProducts?.length || 0}`} fullWidth>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {['#', 'Product', 'Category', 'Orders', 'Revenue', 'Share'].map(h => (
                    <th key={h} style={{
                      textAlign: ['Orders', 'Revenue', 'Share', '#'].includes(h) ? 'center' : 'left',
                      padding: '10px 14px', color: T.dim, fontWeight: 700,
                      textTransform: 'uppercase', fontSize: 10, letterSpacing: 1,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.topProducts || []).map((p, i) => {
                  const share = topTotal > 0 ? ((p.revenue / topTotal) * 100).toFixed(1) : 0
                  return (
                    <tr key={i}
                      style={{ borderBottom: `1px solid rgba(255,255,255,0.03)`, transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        {i === 0 ? <TrophyIcon size={18} strokeWidth={1.8} style={{ color: T.gold }} className={`inline`} /> :
                         i === 1 ? <TrophyIcon size={17} strokeWidth={1.8} style={{ color: '#A8A9AD' }} className={`inline`} /> :
                         i === 2 ? <TrophyIcon size={16} strokeWidth={1.8} style={{ color: '#CD7F32' }} className={`inline`} /> :
                         <span style={{ color: T.dim, fontSize: 12 }}>#{i + 1}</span>}
                      </td>
                      <td style={{ padding: '14px', fontWeight: 600, color: T.text }}>{p.name}</td>
                      <td style={{ padding: '14px', color: T.muted, textTransform: 'capitalize', fontSize: 12 }}>{p.category || '—'}</td>
                      <td style={{ padding: '14px', textAlign: 'center', color: T.muted }}>{p.orders}</td>
                      <td style={{ padding: '14px', textAlign: 'center', color: T.gold, fontWeight: 700 }}>
                        Rs {p.revenue.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 20px 14px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 99, background: PALETTE[i % PALETTE.length], width: `${share}%`, transition: 'width 1.2s ease' }} />
                          </div>
                          <span style={{ color: T.muted, fontSize: 11, minWidth: 36, textAlign: 'right' }}>{share}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {(!data.topProducts?.length) && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: T.muted }}>No product sales data in this range</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Bottom spacing */}
        <div style={{ gridColumn: '1 / -1', height: 24 }} />
      </div>
    </div>
  )
}
