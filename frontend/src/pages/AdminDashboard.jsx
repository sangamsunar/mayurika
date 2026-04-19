import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/userContext'
import AdminAnalytics from './AdminAnalytics'

const EMPTY_FORM = {
  name: '', description: '', category: '', gender: '', ageGroup: 'adult',
  styleType: '', subStyle: '', occasion: '', metalOptions: [],
  purityGold: [], puritySilver: [], minWeightTola: '', maxWeightTola: '',
  makingChargePerTola: '', jartiAmount: '0', stoneCharge: '0',
  measurementType: 'none', isTraditional: false, hallmark: false,
  customizable: true, pickupAvailable: true, region: 'Nepali', inStock: true
}

const ORDER_STATUSES = ['working', 'finishing', 'packaging', 'transit', 'ready_for_pickup', 'delivered', 'cancelled']
const STATUS_LABELS = {
  working: 'Being Made', finishing: 'Finishing', packaging: 'Packaging',
  transit: 'In Transit', ready_for_pickup: 'Ready for Pickup',
  delivered: 'Delivered', cancelled: 'Cancelled'
}
const STATUS_COLORS = {
  working: 'bg-blue-100 text-blue-700', finishing: 'bg-purple-100 text-purple-700',
  packaging: 'bg-yellow-100 text-yellow-700', transit: 'bg-orange-100 text-orange-700',
  ready_for_pickup: 'bg-green-100 text-green-700', delivered: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600'
}

export default function AdminDashboard() {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()

  const [tab, setTab] = useState('analytics')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [goldRate, setGoldRate] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [images, setImages] = useState([])
  const [model, setModel] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [manualRate, setManualRate] = useState({ fineGoldPerTola: '', silverPerTola: '', tejabiGoldPerTola: '' })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusNote, setStatusNote] = useState('')

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/')
  }, [user])

  useEffect(() => {
    fetchProducts()
    fetchGoldRate()
    fetchOrders()
    fetchCustomers()
  }, [])

  const fetchProducts = async () => {
    const { data } = await axios.get('/products')
    setProducts(data)
  }
  const fetchGoldRate = async () => {
    const { data } = await axios.get('/gold-rate')
    setGoldRate(data)
  }
  const fetchOrders = async () => {
    const { data } = await axios.get('/admin/orders')
    if (!data.error) setOrders(data)
  }
  const fetchCustomers = async () => {
    const { data } = await axios.get('/admin/customers')
    if (!data.error) setCustomers(data)
  }

  const handleScrape = async () => {
    setLoading(true)
    const { data } = await axios.post('/gold-rate/scrape')
    if (data.error) toast.error(data.error)
    else { toast.success('Rate scraped!'); fetchGoldRate() }
    setLoading(false)
  }

  const handleManualRate = async () => {
    const { data } = await axios.post('/gold-rate/manual', manualRate)
    if (data.error) toast.error(data.error)
    else { toast.success('Rate updated!'); fetchGoldRate() }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([key, val]) => {
      if (['metalOptions', 'purityGold', 'puritySilver', 'styleType', 'subStyle'].includes(key)) return
      fd.append(key, val)
    })
    fd.append('style', JSON.stringify({ type: form.styleType, subStyle: form.subStyle || null }))
    fd.append('metalOptions', JSON.stringify(form.metalOptions))
    fd.append('purityOptions', JSON.stringify({ gold: form.purityGold, silver: form.puritySilver }))
    images.forEach(img => fd.append('images', img))
    if (model) fd.append('model', model)
    try {
      if (editingId) {
        const { data } = await axios.put(`/products/${editingId}`, fd)
        if (data.error) toast.error(data.error)
        else { toast.success('Product updated!'); resetForm(); fetchProducts() }
      } else {
        const { data } = await axios.post('/products', fd)
        if (data.error) toast.error(data.error)
        else { toast.success('Product created!'); resetForm(); fetchProducts() }
      }
    } catch { toast.error('Something went wrong') }
    setLoading(false)
  }

  const handleEdit = (product) => {
    setEditingId(product._id)
    setForm({
      name: product.name, description: product.description,
      category: product.category, gender: product.gender, ageGroup: product.ageGroup,
      styleType: product.style?.type || '', subStyle: product.style?.subStyle || '',
      occasion: product.occasion || '', metalOptions: product.metalOptions || [],
      purityGold: product.purityOptions?.gold || [], puritySilver: product.purityOptions?.silver || [],
      minWeightTola: product.minWeightTola, maxWeightTola: product.maxWeightTola,
      makingChargePerTola: product.makingChargePerTola, jartiAmount: product.jartiAmount,
      stoneCharge: product.stoneCharge, measurementType: product.measurementType,
      isTraditional: product.isTraditional, hallmark: product.hallmark,
      customizable: product.customizable, pickupAvailable: product.pickupAvailable,
      region: product.region, inStock: product.inStock
    })
    setTab('add')
    window.scrollTo(0, 0)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    const { data } = await axios.delete(`/products/${id}`)
    if (data.error) toast.error(data.error)
    else { toast.success('Deleted!'); fetchProducts() }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    const { data } = await axios.put(`/admin/orders/${orderId}/status`, { status: newStatus, note: statusNote })
    if (data.error) toast.error(data.error)
    else {
      toast.success('Status updated!')
      fetchOrders()
      setSelectedOrder(null)
      setStatusNote('')
    }
  }

  const resetForm = () => { setForm(EMPTY_FORM); setImages([]); setModel(null); setEditingId(null) }
  const toggle = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]

  const inp = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
  const lbl = "block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-widest uppercase">Maryurika Admin</h1>
        <span className="text-sm text-gray-500">Welcome, {user?.name}</span>
      </div>

      <div className="bg-white border-b px-8 flex gap-6 overflow-x-auto">
        {['analytics', 'products', 'add', 'orders', 'customers', 'gold rate'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`py-3 text-sm font-medium uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${tab === t ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t === 'add' ? (editingId ? 'Edit Product' : 'Add Product') : t}
            {t === 'orders' && orders.filter(o => o.status === 'working').length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{orders.filter(o => o.status === 'working').length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ANALYTICS TAB — full-width, outside max-w container */}
      {tab === 'analytics' && <AdminAnalytics />}

      <div className="px-8 py-6 max-w-6xl mx-auto">

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">All Products ({products.length})</h2>
              <button onClick={() => { resetForm(); setTab('add') }} className="bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800">+ Add Product</button>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-20 text-gray-400">No products yet.</div>
            ) : (
              <div className="bg-white rounded border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['Image', 'Name', 'Category', 'Gender', 'Style', 'Stock', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={p._id} className={`border-b hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                        <td className="px-4 py-3">
                          {p.images?.[0]
                            ? <img src={`http://localhost:8000${p.images[0]}`} className="w-10 h-10 object-cover rounded" />
                            : <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">N/A</div>}
                        </td>
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3 capitalize">{p.category}</td>
                        <td className="px-4 py-3 capitalize">{p.gender}</td>
                        <td className="px-4 py-3 capitalize">{p.style?.type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {p.inStock ? 'In Stock' : 'Out'}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <button onClick={() => handleEdit(p)} className="text-xs px-3 py-1 border rounded hover:bg-gray-100">Edit</button>
                          <button onClick={() => handleDelete(p._id)} className="text-xs px-3 py-1 border border-red-300 text-red-500 rounded hover:bg-red-50">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADD/EDIT PRODUCT TAB */}
        {tab === 'add' && (
          <form onSubmit={handleSubmit} className="bg-white rounded border p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              {editingId && <button type="button" onClick={resetForm} className="text-sm text-gray-400 hover:text-gray-600">Cancel Edit</button>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className={lbl}>Product Name</label><input className={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Traditional Tilhari Necklace" required /></div>
              <div className="col-span-2"><label className={lbl}>Description</label><textarea className={inp} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div><label className={lbl}>Category</label>
                <select className={inp} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select</option>
                  {['ring', 'necklace', 'bracelet', 'earring', 'anklet', 'chain', 'cufflink', 'tayo', 'tilhari', 'churra', 'pote', 'kantha', 'set'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className={lbl}>Gender</label>
                <select className={inp} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} required>
                  <option value="">Select</option>
                  <option value="female">Female</option><option value="male">Male</option><option value="unisex">Unisex</option>
                </select>
              </div>
              <div><label className={lbl}>Age Group</label>
                <select className={inp} value={form.ageGroup} onChange={e => setForm({ ...form, ageGroup: e.target.value })}>
                  <option value="adult">Adult</option><option value="youth">Youth</option><option value="kids">Kids</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div><label className={lbl}>Style</label>
                <select className={inp} value={form.styleType} onChange={e => setForm({ ...form, styleType: e.target.value, subStyle: '' })}>
                  <option value="">Select</option>
                  <option value="traditional">Traditional</option><option value="wedding">Wedding</option><option value="casual">Casual</option><option value="youth">Youth</option>
                </select>
              </div>
              {form.styleType === 'youth' && (
                <div><label className={lbl}>Sub Style</label>
                  <select className={inp} value={form.subStyle} onChange={e => setForm({ ...form, subStyle: e.target.value })}>
                    <option value="">Select</option>
                    {['gothic', 'cybersilian', 'streetwear', 'minimalist', 'cottagecore'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div><label className={lbl}>Occasion</label>
                <select className={inp} value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}>
                  <option value="">Select</option>
                  {['wedding', 'casual', 'festival', 'daily', 'gifting'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={lbl}>Metal Options</label>
              <div className="flex gap-4">
                {['gold', 'silver', 'roseGold'].map(m => (
                  <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.metalOptions.includes(m)} onChange={() => setForm({ ...form, metalOptions: toggle(form.metalOptions, m) })} />
                    <span className="capitalize">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {form.metalOptions.includes('gold') && (
                <div><label className={lbl}>Gold Purity</label>
                  <div className="flex gap-3 flex-wrap">
                    {['24K', '23K', '22K', '18K'].map(p => (
                      <label key={p} className="flex items-center gap-1 text-sm cursor-pointer">
                        <input type="checkbox" checked={form.purityGold.includes(p)} onChange={() => setForm({ ...form, purityGold: toggle(form.purityGold, p) })} />{p}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {form.metalOptions.includes('silver') && (
                <div><label className={lbl}>Silver Purity</label>
                  <div className="flex gap-3 flex-wrap">
                    {['999', '925'].map(p => (
                      <label key={p} className="flex items-center gap-1 text-sm cursor-pointer">
                        <input type="checkbox" checked={form.puritySilver.includes(p)} onChange={() => setForm({ ...form, puritySilver: toggle(form.puritySilver, p) })} />{p}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Min Weight (Tola)</label><input className={inp} type="number" step="0.1" value={form.minWeightTola} onChange={e => setForm({ ...form, minWeightTola: e.target.value })} required /></div>
              <div><label className={lbl}>Max Weight (Tola)</label><input className={inp} type="number" step="0.1" value={form.maxWeightTola} onChange={e => setForm({ ...form, maxWeightTola: e.target.value })} required /></div>
              <div><label className={lbl}>Making Charge (Rs)</label><input className={inp} type="number" value={form.makingChargePerTola} onChange={e => setForm({ ...form, makingChargePerTola: e.target.value })} required /></div>
              <div><label className={lbl}>Jarti Amount (Rs)</label><input className={inp} type="number" value={form.jartiAmount} onChange={e => setForm({ ...form, jartiAmount: e.target.value })} /></div>
              <div><label className={lbl}>Stone Charge (Rs)</label><input className={inp} type="number" value={form.stoneCharge} onChange={e => setForm({ ...form, stoneCharge: e.target.value })} /></div>
              <div><label className={lbl}>Measurement Type</label>
                <select className={inp} value={form.measurementType} onChange={e => setForm({ ...form, measurementType: e.target.value })}>
                  <option value="none">None</option><option value="circumference">Circumference</option><option value="length">Length</option><option value="diameter">Diameter</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              {[['isTraditional', 'Traditional'], ['hallmark', 'Hallmark'], ['customizable', 'Customizable'], ['pickupAvailable', 'Pickup Available'], ['inStock', 'In Stock']].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />{label}
                </label>
              ))}
            </div>

            <div><label className={lbl}>Product Images (max 5)</label>
              <input type="file" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files))} className="text-sm" />
              {images.length > 0 && <p className="text-xs text-gray-400 mt-1">{images.length} image(s) selected</p>}
            </div>

            <div><label className={lbl}>3D Model (.glb / .gltf)</label>
              <input type="file" accept=".glb,.gltf" onChange={e => setModel(e.target.files[0])} className="text-sm" />
              {model && <p className="text-xs text-gray-400 mt-1">{model.name}</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded font-medium hover:bg-gray-800 disabled:opacity-50 transition">
              {loading ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
            </button>
          </form>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div>
            <h2 className="font-semibold text-lg mb-4">All Orders ({orders.length})</h2>

            {/* Order detail modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Order #{selectedOrder._id.slice(-8).toUpperCase()}</h3>
                    <button onClick={() => { setSelectedOrder(null); setStatusNote('') }} className="text-gray-400 hover:text-gray-700 text-2xl">×</button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Customer</span><span className="font-medium">{selectedOrder.user?.name}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Email</span><span>{selectedOrder.user?.email}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery</span><span className="capitalize">{selectedOrder.deliveryType}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Total</span><span className="font-bold">Rs {selectedOrder.grandTotal?.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Advance Paid</span><span>Rs {selectedOrder.advancePaid?.toLocaleString()}</span></div>
                  </div>

                  {selectedOrder.deliveryAddress && (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm mb-4">
                      <p className="font-semibold mb-1">Delivery Address</p>
                      <p className="text-gray-600">{selectedOrder.deliveryAddress.fullName} · {selectedOrder.deliveryAddress.phone}</p>
                      <p className="text-gray-600">{selectedOrder.deliveryAddress.address}, {selectedOrder.deliveryAddress.city}</p>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="font-semibold text-sm mb-2">Items</p>
                    {selectedOrder.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0">
                        <span>{item.product?.name || 'Product'} · {item.selectedMetal} {item.selectedPurity} {item.selectedWeight}t</span>
                        <span>Rs {item.itemTotal?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Update Status</p>
                    <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
                      defaultValue={selectedOrder.status}
                      onChange={e => setStatusNote(prev => prev)}
                      id="statusSelect">
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    <input value={statusNote} onChange={e => setStatusNote(e.target.value)}
                      placeholder="Optional note (e.g. Dispatched via Blue Dart)"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black" />
                    <button
                      onClick={() => {
                        const sel = document.getElementById('statusSelect')
                        handleUpdateStatus(selectedOrder._id, sel.value)
                      }}
                      className="w-full bg-black text-white py-2.5 rounded font-medium hover:bg-gray-800 transition text-sm">
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            )}

            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-400">No orders yet.</div>
            ) : (
              <div className="bg-white rounded border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['Order ID', 'Customer', 'Items', 'Total', 'Delivery', 'Status', 'Date', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, i) => (
                      <tr key={order._id} className={`border-b hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                        <td className="px-4 py-3 font-mono text-xs">#{order._id.slice(-6).toUpperCase()}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-xs">{order.user?.name}</p>
                          <p className="text-gray-400 text-xs">{order.user?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-xs">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                        <td className="px-4 py-3 font-semibold text-xs">Rs {order.grandTotal?.toLocaleString()}</td>
                        <td className="px-4 py-3 capitalize text-xs">{order.deliveryType}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelectedOrder(order)} className="text-xs px-3 py-1 border rounded hover:bg-gray-100">Manage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {tab === 'customers' && (
          <div>
            <h2 className="font-semibold text-lg mb-4">All Customers ({customers.length})</h2>
            {customers.length === 0 ? (
              <div className="text-center py-20 text-gray-400">No customers yet.</div>
            ) : (
              <div className="bg-white rounded border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['Name', 'Email', 'Phone', 'Gender', 'Orders', 'Total Spent', 'Joined', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <tr key={c._id} className={`border-b hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {c.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-xs">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{c.email}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{c.phone || '—'}</td>
                        <td className="px-4 py-3 text-xs capitalize text-gray-500">
                          {c.gender ? c.gender.replace('_', ' ') : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold">{c.orderCount}</td>
                        <td className="px-4 py-3 text-xs font-semibold">
                          {c.totalSpent > 0 ? `Rs ${c.totalSpent.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {c.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* GOLD RATE TAB */}
        {tab === 'gold rate' && (
          <div className="space-y-6">
            <div className="bg-white rounded border p-6">
              <h2 className="font-semibold text-lg mb-4">Current Gold & Silver Rate</h2>
              {goldRate ? (
                <div className="grid grid-cols-3 gap-4">
                  {[['Fine Gold (9999)', goldRate.fineGoldPerTola], ['Tejabi Gold', goldRate.tejabiGoldPerTola], ['Silver', goldRate.silverPerTola]].map(([label, val]) => (
                    <div key={label} className="bg-yellow-50 border border-yellow-200 rounded p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                      <p className="text-2xl font-bold mt-1">Rs {val?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">per tola</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400">No rate found</p>}
              <div className="mt-4 flex gap-3 items-center">
                <button onClick={handleScrape} disabled={loading} className="bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800 disabled:opacity-50">
                  {loading ? 'Scraping...' : 'Scrape from fenegosida.org'}
                </button>
                {goldRate && <span className="text-xs text-gray-400">{goldRate.isManual ? '— Set manually' : `— Last scraped: ${new Date(goldRate.lastScraped).toLocaleString()}`}</span>}
              </div>
            </div>

            <div className="bg-white rounded border p-6">
              <h2 className="font-semibold text-lg mb-4">Set Rate Manually</h2>
              <div className="grid grid-cols-3 gap-4">
                {[['fineGoldPerTola', 'Fine Gold / Tola (Rs)', '291400'], ['tejabiGoldPerTola', 'Tejabi Gold / Tola (Rs)', '0'], ['silverPerTola', 'Silver / Tola (Rs)', '4780']].map(([key, label, ph]) => (
                  <div key={key}><label className={lbl}>{label}</label>
                    <input className={inp} type="number" value={manualRate[key]} onChange={e => setManualRate({ ...manualRate, [key]: e.target.value })} placeholder={ph} />
                  </div>
                ))}
              </div>
              <button onClick={handleManualRate} className="mt-4 bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800">Save Manual Rate</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
