import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import { CheckIcon, PackageIcon, ArrowRightIcon } from '../components/Icons'

const STATUS_STEPS = [
  { key: 'working',   label: 'Being Made' },
  { key: 'finishing', label: 'Finishing' },
  { key: 'packaging', label: 'Packaging' },
  { key: 'transit',   label: 'On the Way' },
  { key: 'delivered', label: 'Delivered' },
]

function printReceipt(order) {
  const itemRows = (order.items || []).map(item => `
    <tr>
      <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0">${item.product?.name || 'Jewellery'}</td>
      <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:11px;color:#666;text-transform:capitalize">${item.selectedMetal} · ${item.selectedPurity} · ${item.selectedWeight}t × ${item.quantity || 1}</td>
      <td style="padding:8px 4px;border-bottom:1px solid #f0f0f0;text-align:right">Rs ${(item.itemTotal || 0).toLocaleString()}</td>
    </tr>
  `).join('')
  const win = window.open('', '_blank', 'width=700,height=900')
  win.document.write(`<!DOCTYPE html><html><head><title>Receipt — Maryurika #${order._id.slice(-8).toUpperCase()}</title>
    <style>
      body{font-family:Arial,sans-serif;margin:0;padding:40px;color:#111}
      h1{letter-spacing:4px;text-align:center;font-size:22px;margin:0}
      .sub{text-align:center;color:#999;font-size:12px;margin:4px 0 24px}
      hr{border:none;border-top:1px solid #eee;margin:16px 0}
      .row{display:flex;justify-content:space-between;margin:6px 0;font-size:13px}
      .lbl{color:#666}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      thead tr{background:#000;color:#fff}
      th{padding:10px 4px;font-size:11px;text-align:left}
      th:last-child{text-align:right}
      th:nth-child(2){text-align:center}
      .grand{font-size:15px;font-weight:bold}
      .footer{margin-top:40px;text-align:center;font-size:11px;color:#bbb}
      @media print{body{padding:20px}}
    </style></head><body>
    <h1>MARYURIKA</h1>
    <p class="sub">Official Order Receipt</p>
    <hr/>
    <div class="row"><span class="lbl">Order ID</span><span style="font-family:monospace;font-weight:bold">#${order._id.slice(-8).toUpperCase()}</span></div>
    <div class="row"><span class="lbl">Date</span><span>${new Date(order.createdAt).toLocaleDateString('en-NP',{year:'numeric',month:'long',day:'numeric'})}</span></div>
    <div class="row"><span class="lbl">Delivery</span><span style="text-transform:capitalize">${order.deliveryType}</span></div>
    <div class="row"><span class="lbl">Payment</span><span style="text-transform:capitalize">${order.paymentMethod || '—'}</span></div>
    ${order.deliveryAddress?.fullName ? `<div class="row"><span class="lbl">Deliver to</span><span>${order.deliveryAddress.fullName}, ${order.deliveryAddress.address || ''}, ${order.deliveryAddress.city || ''}</span></div>` : ''}
    <hr/>
    <table>
      <thead><tr><th>Item</th><th>Details</th><th style="text-align:right">Price</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div style="margin-top:16px">
      ${order.deliveryCharge > 0 ? `<div class="row"><span class="lbl">Delivery charge</span><span>Rs ${order.deliveryCharge.toLocaleString()}</span></div>` : ''}
      <div class="row grand"><span>Grand Total</span><span>Rs ${(order.grandTotal||0).toLocaleString()}</span></div>
      <div class="row" style="color:#16a34a;font-size:13px"><span>Advance Paid</span><span>Rs ${(order.advancePaid||0).toLocaleString()}</span></div>
      ${order.grandTotal-order.advancePaid > 0 ? `<div class="row" style="color:#ea580c;font-size:12px"><span>Balance due on ${order.deliveryType==='pickup'?'pickup':'delivery'}</span><span>Rs ${(order.grandTotal-order.advancePaid).toLocaleString()}</span></div>` : ''}
    </div>
    <hr/>
    <div class="footer"><p>Thank you for choosing Maryurika Jewellery</p><p>Kathmandu, Nepal · Computer-generated receipt</p></div>
    <script>window.onload=function(){window.print()}</script>
    </body></html>`)
  win.document.close()
}

export default function OrderSuccess() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const orderId = params.get('orderId')
  const sessionId = params.get('session_id')

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!orderId) { navigate('/'); return }
    const run = async () => {
      if (sessionId) {
        try {
          const { data: v } = await axios.post('/stripe/verify-session', { sessionId, orderId })
          if (v.success) setVerified(true)
        } catch (e) { console.warn('Stripe verify failed:', e.message) }
      }
      try {
        const { data } = await axios.get(`/orders/${orderId}`)
        setOrder(data)
      } catch {}
      setLoading(false)
    }
    run()
  }, [orderId, sessionId])

  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-ink-dim">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#C9A96E] rounded-full animate-spin" />
        <span className="text-[11px] tracking-[0.3em] uppercase">Confirming payment</span>
      </div>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen bg-void flex items-center justify-center text-ink-dim">
      Order not found
    </div>
  )

  const currentStep = STATUS_STEPS.findIndex(s => s.key === order.status)

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #C9A96E 0%, transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
        className="max-w-xl w-full space-y-5 relative z-10">

        <div className="glass rounded-2xl p-10 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 glass-gold rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckIcon size={32} className="text-[#C9A96E]" strokeWidth={2} />
          </motion.div>
          <h1 className="font-display text-3xl font-semibold text-ink mb-2">Order Placed</h1>
          <p className="text-ink-muted text-sm">A confirmation email has been sent to your inbox.</p>

          {sessionId && (
            <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase
              ${verified ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
              {verified ? '✓ Stripe Verified' : 'Verifying…'}
            </div>
          )}

          <div className="mt-5 glass-sm rounded-xl px-5 py-3 inline-block">
            <p className="text-[9px] text-ink-dim uppercase tracking-[0.3em] mb-1">Order ID</p>
            <p className="font-mono font-bold text-lg text-gradient-gold">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="text-[10px] text-ink-dim uppercase tracking-[0.3em] mb-3">Payment Status</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase
            ${order.paymentStatus === 'fully_paid' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : order.paymentStatus === 'advance_paid' ? 'bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30'
              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
            {order.paymentStatus === 'fully_paid' && '✓ Fully Paid'}
            {order.paymentStatus === 'advance_paid' && 'Advance Paid'}
            {order.paymentStatus === 'pending' && 'Payment Pending'}
          </div>
          {order.paymentMethod && (
            <p className="text-[11px] text-ink-dim mt-3 capitalize">
              via {order.paymentMethod === 'stripe' ? 'Card (Stripe)' : order.paymentMethod}
            </p>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="text-[10px] text-ink-dim uppercase tracking-[0.3em] mb-4">Progress</p>
          <div className="space-y-4">
            {STATUS_STEPS.map((step, i) => {
              const done = i < currentStep
              const current = i === currentStep
              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs flex-shrink-0 border
                    ${current ? 'bg-[#C9A96E] text-[#07070A] border-[#C9A96E]'
                      : done ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-white/[0.03] text-ink-dim border-white/[0.08]'}`}>
                    {done ? <CheckIcon size={14} strokeWidth={2.5} /> : (i + 1)}
                  </div>
                  <p className={`text-sm font-medium ${current ? 'text-ink' : done ? 'text-emerald-400' : 'text-ink-dim'}`}>
                    {step.label}
                    {current && <span className="ml-2 text-[9px] bg-[#C9A96E] text-[#07070A] px-2 py-0.5 rounded-full tracking-wider">CURRENT</span>}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="text-[10px] text-ink-dim uppercase tracking-[0.3em] mb-4">Summary</p>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-ink">{item.product?.name || 'Jewellery'}</p>
                  <p className="text-[11px] text-ink-dim capitalize mt-0.5">
                    {item.selectedMetal} · {item.selectedPurity} · {item.selectedWeight} tola
                  </p>
                </div>
                <span className="font-medium text-ink-muted">Rs {item.itemTotal?.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] mt-4 pt-4 space-y-2 text-sm">
            {order.deliveryCharge > 0 && (
              <div className="flex justify-between text-ink-dim">
                <span>Delivery</span><span>Rs {order.deliveryCharge}</span>
              </div>
            )}
            <div className="flex justify-between font-display text-lg font-semibold">
              <span className="text-ink">Grand Total</span>
              <span className="text-gradient-gold">Rs {order.grandTotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-400 text-[11px]">
              <span>Advance Paid</span><span>Rs {order.advancePaid?.toLocaleString()}</span>
            </div>
            {order.grandTotal - order.advancePaid > 0 && (
              <div className="flex justify-between text-amber-400 text-[11px]">
                <span>Remaining (pay on {order.deliveryType === 'pickup' ? 'pickup' : 'delivery'})</span>
                <span>Rs {(order.grandTotal - order.advancePaid).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Link to="/profile" className="flex-1 btn-gold text-center flex items-center justify-center gap-2">
            Track Order <ArrowRightIcon size={14} />
          </Link>
          <button onClick={() => printReceipt(order)}
            className="flex-1 glass-sm text-ink-muted py-3 px-4 rounded-xl text-sm font-medium text-center hover:text-ink hover:border-white/20 transition flex items-center justify-center gap-2">
            <PackageIcon size={14} /> Receipt
          </button>
          <Link to="/"
            className="flex-1 glass-sm text-ink-muted py-3 px-4 rounded-xl text-sm font-medium text-center hover:text-ink hover:border-white/20 transition">
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
