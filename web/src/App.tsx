 import { initApp } from '@freeappstore/sdk'
import { Shell } from '@freeappstore/sdk/ui'
import { useState, useEffect } from 'react'
import { MdDevices, MdRestaurant, MdCheckroom, MdBuild, MdInventory2, MdWarning, MdRemoveShoppingCart, MdAdd, MdRemove, MdEdit, MdDelete, MdSearch, MdDashboard, MdListAlt, MdPayments, MdShoppingCart, MdPieChart, MdAddCircle, MdSearchOff } from 'react-icons/md'

const fas = initApp({ appId: 'stock-tracker' })

type Category = 'Electronics' | 'Food' | 'Clothing' | 'Equipment' | 'Other'

interface Product {
  id: number
  name: string
  category: Category
  quantity: number
  price: number
  lowStockThreshold: number
}

const CATEGORIES: Category[] = ['Electronics', 'Food', 'Clothing', 'Equipment', 'Other']

const CATEGORY_COLORS: Record<Category, string> = {
  Electronics: '#3b82f6',
  Food: '#10b981',
  Clothing: '#8b5cf6',
  Equipment: '#f59e0b',
  Other: '#64748b',
}

const CATEGORY_BG: Record<Category, string> = {
  Electronics: '#dbeafe',
  Food: '#d1fae5',
  Clothing: '#ede9fe',
  Equipment: '#fef3c7',
  Other: '#f1f5f9',
}

function CategoryIcon({ category, size = 22 }: { category: Category; size?: number }) {
  const color = CATEGORY_COLORS[category]
  const bg = CATEGORY_BG[category]
  const props = { size, color }
  const icon = (() => {
    switch (category) {
      case 'Electronics': return <MdDevices {...props} />
      case 'Food': return <MdRestaurant {...props} />
      case 'Clothing': return <MdCheckroom {...props} />
      case 'Equipment': return <MdBuild {...props} />
      case 'Other': return <MdInventory2 {...props} />
    }
  })()

  return (
    <div style={{
      background: bg,
      border: `2px solid ${color}40`,
      borderRadius: '14px',
      width: size + 18,
      height: size + 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 2px 8px ${color}30`,
      flexShrink: 0,
    }}>
      {icon}
    </div>
  )
}

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('stock-tracker')
    return saved ? JSON.parse(saved) : []
  })
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', category: 'Other' as Category, quantity: 0, price: 0, lowStockThreshold: 5 })
  const [activeTab, setActiveTab] = useState<'inventory' | 'dashboard'>('dashboard')

  useEffect(() => {
    localStorage.setItem('stock-tracker', JSON.stringify(products))
  }, [products])

  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const totalProducts = products.length
  const lowStockItems = products.filter(p => p.quantity > 0 && p.quantity <= p.lowStockThreshold)
  const outOfStock = products.filter(p => p.quantity === 0)

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === 'All' || p.category === filterCategory
    return matchSearch && matchCategory
  })

  function saveProduct() {
    if (!form.name.trim()) return
    if (editProduct) {
      setProducts(products.map(p => p.id === editProduct.id ? { ...form, id: editProduct.id } : p))
    } else {
      setProducts([...products, { ...form, id: Date.now() }])
    }
    setForm({ name: '', category: 'Other', quantity: 0, price: 0, lowStockThreshold: 5 })
    setShowForm(false)
    setEditProduct(null)
  }

  function deleteProduct(id: number) {
    setProducts(products.filter(p => p.id !== id))
  }

  function adjustQuantity(id: number, amount: number) {
    setProducts(products.map(p => p.id === id ? { ...p, quantity: Math.max(0, p.quantity + amount) } : p))
  }

  function openEdit(product: Product) {
    setEditProduct(product)
    setForm({ name: product.name, category: product.category, quantity: product.quantity, price: product.price, lowStockThreshold: product.lowStockThreshold })
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditProduct(null)
    setForm({ name: '', category: 'Other', quantity: 0, price: 0, lowStockThreshold: 5 })
  }

  const stockStatus = (p: Product) => {
    if (p.quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' }
    if (p.quantity <= p.lowStockThreshold) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-700 border-orange-200' }
    return { label: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200' }
  }

  return (
    <Shell app={fas} appName="stock-tracker">
      <div className="min-h-screen" style={{ background: '#f0f4ff' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }} className="px-6 py-5 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <MdInventory2 size={28} color="white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Stock Tracker</h1>
                <p className="text-blue-200 text-sm">Manage your inventory with ease</p>
              </div>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditProduct(null) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-blue-700 bg-white hover:bg-blue-50 transition text-sm shadow"
            >
              <MdAdd size={18} color="#1d4ed8" />
              Add Product
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">

          {/* Alerts */}
          {lowStockItems.length > 0 && (
            <div className="rounded-xl p-4 mb-4 flex items-center gap-3" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
              <MdWarning size={24} color="#ea580c" />
              <div>
                <p className="font-semibold text-orange-800 text-sm">{lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low!</p>
                <p className="text-orange-600 text-xs">{lowStockItems.map(p => p.name).join(', ')}</p>
              </div>
            </div>
          )}

          {outOfStock.length > 0 && (
            <div className="rounded-xl p-4 mb-6 flex items-center gap-3" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <MdRemoveShoppingCart size={24} color="#dc2626" />
              <div>
                <p className="font-semibold text-red-800 text-sm">{outOfStock.length} item{outOfStock.length > 1 ? 's' : ''} out of stock!</p>
                <p className="text-red-600 text-xs">{outOfStock.map(p => p.name).join(', ')}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {([
              { key: 'dashboard', icon: <MdDashboard size={18} />, label: 'Dashboard' },
              { key: 'inventory', icon: <MdListAlt size={18} />, label: 'Inventory' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition ${activeTab === tab.key ? 'bg-blue-600 text-white shadow' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Products', value: totalProducts, icon: <MdInventory2 size={30} color="#1e40af" />, bg: '#dbeafe', color: '#1e40af' },
                  { label: 'Total Value', value: `$${totalValue.toFixed(2)}`, icon: <MdPayments size={30} color="#059669" />, bg: '#d1fae5', color: '#059669' },
                  { label: 'Low Stock', value: lowStockItems.length, icon: <MdWarning size={30} color="#d97706" />, bg: '#fef3c7', color: '#d97706' },
                  { label: 'Out of Stock', value: outOfStock.length, icon: <MdRemoveShoppingCart size={30} color="#dc2626" />, bg: '#fee2e2', color: '#dc2626' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-2xl p-4 bg-white shadow-sm border border-blue-100">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: stat.bg, boxShadow: `0 2px 8px ${stat.color}20` }}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100 mb-6">
                <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <MdPieChart size={20} color="#3b82f6" />
                  Category Breakdown
                </h3>
                {CATEGORIES.map(cat => {
                  const catProducts = products.filter(p => p.category === cat)
                  const catValue = catProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)
                  const pct = totalProducts > 0 ? (catProducts.length / totalProducts) * 100 : 0
                  return (
                    <div key={cat} className="mb-4 flex items-center gap-3">
                      <CategoryIcon category={cat} size={20} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 font-medium">{cat}</span>
                          <span className="text-gray-500 text-xs">{catProducts.length} items · ${catValue.toFixed(2)}</span>
                        </div>
                        <div className="w-full rounded-full h-2" style={{ background: '#f1f5f9' }}>
                          <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat] }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Needs Restocking */}
              {lowStockItems.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MdShoppingCart size={20} color="#ea580c" />
                    Needs Restocking
                  </h3>
                  <div className="flex flex-col gap-2">
                    {lowStockItems.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                        <div className="flex items-center gap-3">
                          <CategoryIcon category={p.category} size={20} />
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                            <p className="text-orange-600 text-xs">{p.quantity} left · threshold: {p.lowStockThreshold}</p>
                          </div>
                        </div>
                        <button onClick={() => adjustQuantity(p.id, 10)} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold">
                          <MdAdd size={14} color="white" />+10
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {products.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: '#f1f5f9' }}>
                    <MdInventory2 size={40} color="#cbd5e1" />
                  </div>
                  <p className="font-semibold">No products yet</p>
                  <p className="text-sm mt-1">Click "Add Product" to get started</p>
                </div>
              )}
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div>
              <div className="flex gap-3 mb-4">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-blue-100 shadow-sm">
                  <MdSearch size={18} color="#94a3b8" />
                  <input
                    className="flex-1 text-gray-800 outline-none text-sm bg-transparent"
                    placeholder="Search products..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-2.5 rounded-xl bg-white border border-blue-100 text-gray-700 outline-none text-sm shadow-sm"
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value as Category | 'All')}
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                {filtered.map(product => {
                  const status = stockStatus(product)
                  return (
                    <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <CategoryIcon category={product.category} size={24} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-gray-800">{product.name}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${status.color}`}>{status.label}</span>
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {product.category} · ${product.price.toFixed(2)} each · Total: <span className="font-semibold text-blue-600">${(product.price * product.quantity).toFixed(2)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-blue-50">
                            <MdEdit size={18} color="#3b82f6" />
                          </button>
                          <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded-lg hover:bg-red-50">
                            <MdDelete size={18} color="#ef4444" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                        <span className="text-gray-500 text-xs">Qty:</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => adjustQuantity(product.id, -1)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#dbeafe' }}>
                            <MdRemove size={16} color="#2563eb" />
                          </button>
                          <span className="font-bold text-gray-800 w-8 text-center">{product.quantity}</span>
                          <button onClick={() => adjustQuantity(product.id, 1)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#dbeafe' }}>
                            <MdAdd size={16} color="#2563eb" />
                          </button>
                        </div>
                        <button onClick={() => adjustQuantity(product.id, 10)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold">
                          <MdAdd size={12} color="white" />10
                        </button>
                        <button onClick={() => adjustQuantity(product.id, -10)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-600 text-xs font-semibold" style={{ background: '#f1f5f9' }}>
                          <MdRemove size={12} color="#4b5563" />10
                        </button>
                      </div>
                    </div>
                  )
                })}

                {filtered.length === 0 && (
                  <div className="text-center py-16 text-gray-400">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: '#f1f5f9' }}>
                      <MdSearchOff size={40} color="#cbd5e1" />
                    </div>
                    <p className="font-semibold">No products found</p>
                    <p className="text-sm mt-1">Try a different search or category</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <a href="https://freeappstore.online" target="_blank" rel="noopener noreferrer" className="text-blue-300 text-xs hover:text-blue-400">Built for freeappstore.online</a>
          </div>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#dbeafe' }}>
                  {editProduct ? <MdEdit size={20} color="#2563eb" /> : <MdAddCircle size={20} color="#2563eb" />}
                </div>
                <h2 className="text-lg font-bold text-gray-800">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              </div>
              <div className="flex flex-col gap-3">
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 outline-none text-sm"
                  placeholder="Product name *"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 outline-none text-sm"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as Category })}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Quantity</label>
                    <input
                      type="number" min={0}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 outline-none text-sm"
                      value={form.quantity}
                      onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Price ($)</label>
                    <input
                      type="number" min={0} step={0.01}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 outline-none text-sm"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Low Stock Alert Threshold</label>
                  <input
                    type="number" min={1}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 outline-none text-sm"
                    value={form.lowStockThreshold}
                    onChange={e => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={cancelForm} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">Cancel</button>
                  <button
                    onClick={saveProduct}
                    disabled={!form.name.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-40"
                  >
                    {editProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Shell>
  )
}