import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/userContext'

const ORDER_STATUS_LABELS = {
  working:          { label: 'Being Made',        color: 'bg-blue-100 text-blue-700' },
  finishing:        { label: 'Finishing',          color: 'bg-purple-100 text-purple-700' },
  packaging:        { label: 'Packaging',          color: 'bg-yellow-100 text-yellow-700' },
  transit:          { label: 'On the Way',         color: 'bg-orange-100 text-orange-700' },
  ready_for_pickup: { label: 'Ready for Pickup',   color: 'bg-green-100 text-green-700' },
  delivered:        { label: 'Delivered',          color: 'bg-gray-100 text-gray-600' },
  cancelled:        { label: 'Cancelled',          color: 'bg-red-100 text-red-600' },
}

const STATUS_STEPS = ['working', 'finishing', 'packaging', 'transit', 'delivered']

export default function Profile() {
  const { user, setUser } = useContext(UserContext)
  const navigate = useNavigate()

  const [tab, setTab]             = useState('orders')
  const [orders, setOrders]       = useState([])
  const [sizeProfile, setSizeProfile] = useState({ finger: '', neck: '', wrist: '', ankle: '', notes: '' })
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [ordersRes, profileRes] = await Promise.all([
        axios.get('/orders'),
        axios.get('/size-profile')
      ])
      setOrders(ordersRes.data)
      const sp = profileRes.data.sizeProfile || {}
      setSizeProfile({
        finger: sp.finger || '',
        neck:   sp.neck   || '',
        wrist:  sp.wrist  || '',
        ankle:  sp.ankle  || '',
        notes:  sp.notes  || ''
      })
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  const handleSaveSize = async () => {
    setSaving(true)
    const { data } = await axios.put('/size-profile', sizeProfile)
    if (data.error) toast.error(data.error)
    else toast.success('Size profile saved!')
    setSaving(false)
  }

  const handleLogout = async () => {
    await axios.post('/logout')
    setUser(null)
    navigate('/')
    toast.success('Logged out')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>

  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
  const lbl = "block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{user?.name}</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
          <button onClick={handleLogout}
            className="text-sm border border-gray-300 px-4 py-2 rounded-lg hover:border-gray-500 transition">
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-8">
        <div className="max-w-4xl mx-auto flex gap-6">
          {['orders', 'sizes'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-3 text-sm font-medium uppercase tracking-wide border-b-2 transition-colors capitalize
                ${tab === t ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t === 'sizes' ? 'Size Profile' : 'My Orders'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-6">

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg mb-2">No orders yet</p>
                <button onClick={() => navigate('/women')}
                  className="text-sm bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
                  Start Shopping
                </button>
              </div>
            ) : orders.map(order => {
              const statusInfo = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' }
              const currentStep = STATUS_STEPS.indexOf(order.status)

              return (
                <div key={order._id} className="bg-white rounded-xl border p-5 space-y-4">
                  {/* Order header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Order ID</p>
                      <p className="font-mono text-sm font-medium mt-0.5">{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {order.status !== 'cancelled' && order.deliveryType !== 'pickup' && (
                    <div className="flex items-center gap-1">
                      {STATUS_STEPS.map((step, i) => (
                        <div key={step} className="flex items-center flex-1">
                          <div className={`w-full h-1.5 rounded-full transition-all ${i <= currentStep ? 'bg-black' : 'bg-gray-200'}`} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          {item.product?.images?.[0] && (
                            <img src={`http://localhost:8000${item.product.images[0]}`}
                              className="w-10 h-10 rounded object-cover" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{item.product?.name || 'Product'}</p>
                            <p className="text-xs text-gray-400 capitalize">
                              {item.selectedMetal} · {item.selectedPurity} · {item.selectedWeight} tola
                            </p>
                          </div>
                        </div>
                        <span className="font-medium">Rs {item.itemTotal?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="border-t pt-3 flex justify-between items-center text-sm">
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="capitalize">📦 {order.deliveryType}</span>
                      <span>💳 Advance: Rs {order.advancePaid?.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-bold">Rs {order.grandTotal?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── SIZE PROFILE TAB ── */}
        {tab === 'sizes' && (
          <div className="bg-white rounded-xl border p-6 max-w-md space-y-5">
            <div>
              <h2 className="font-bold text-lg">Your Size Profile</h2>
              <p className="text-sm text-gray-400 mt-1">Saved sizes auto-fill when you shop, but you can always adjust before ordering.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={lbl}>Finger circumference (mm)</label>
                <input className={inp} type="number" placeholder="e.g. 52"
                  value={sizeProfile.finger}
                  onChange={e => setSizeProfile({ ...sizeProfile, finger: e.target.value })} />
                <p className="text-xs text-gray-400 mt-1">For rings</p>
              </div>
              <div>
                <label className={lbl}>Neck circumference (cm)</label>
                <input className={inp} type="number" placeholder="e.g. 35"
                  value={sizeProfile.neck}
                  onChange={e => setSizeProfile({ ...sizeProfile, neck: e.target.value })} />
                <p className="text-xs text-gray-400 mt-1">For necklaces, tilhari, pote, chains</p>
              </div>
              <div>
                <label className={lbl}>Wrist circumference (cm)</label>
                <input className={inp} type="number" placeholder="e.g. 16"
                  value={sizeProfile.wrist}
                  onChange={e => setSizeProfile({ ...sizeProfile, wrist: e.target.value })} />
                <p className="text-xs text-gray-400 mt-1">For bracelets, churra</p>
              </div>
              <div>
                <label className={lbl}>Ankle circumference (cm)</label>
                <input className={inp} type="number" placeholder="e.g. 22"
                  value={sizeProfile.ankle}
                  onChange={e => setSizeProfile({ ...sizeProfile, ankle: e.target.value })} />
                <p className="text-xs text-gray-400 mt-1">For anklets</p>
              </div>
              <div>
                <label className={lbl}>Notes</label>
                <input className={inp} type="text" placeholder="e.g. I prefer slightly loose fit"
                  value={sizeProfile.notes}
                  onChange={e => setSizeProfile({ ...sizeProfile, notes: e.target.value })} />
              </div>
            </div>

            <button onClick={handleSaveSize} disabled={saving}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 text-sm">
              {saving ? 'Saving...' : 'Save Size Profile'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}