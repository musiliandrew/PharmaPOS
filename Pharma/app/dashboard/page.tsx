'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Boxes, LayoutDashboard, ShoppingCart, Package, AlertTriangle, RefreshCw,
  Plus, Search, Check, Smartphone, Sparkles, Truck, ClipboardList, Users,
  FileText, TrendingUp, ShoppingBag, PieChart, Sliders, ArrowUpRight,
  Calculator, ChevronDown, CircleHelp, DollarSign, Menu, Receipt,
  Settings, X, Zap, Edit, Activity, BarChart3, Bell, Store, Lock
} from 'lucide-react'
import api from '@/lib/api'
import { AddProductModal } from '@/components/AddProductModal'
import { AddBatchModal } from '@/components/AddBatchModal'
import { AddSupplierModal } from '@/components/AddSupplierModal'
import { AddCustomerModal } from '@/components/AddCustomerModal'

const money = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 })

const MGMT_NAV = [
  ['Overview', LayoutDashboard], ['Products', Package],
  ['Inventory', Boxes], ['Purchasing', ClipboardList], ['Suppliers', Truck],
  ['Sales', Receipt], ['Customers', Users], ['Reports', BarChart3],
  ['AI Assistant', Zap], ['Settings', Settings],
] as const

function Metric({ label, value, change, icon: Icon, positive = true }: { label: string; value: string; change: string; icon: typeof DollarSign; positive?: boolean }) {
  return (
    <div className="metric-card">
      <div className="metric-top"><span>{label}</span><span className="icon-box"><Icon size={17} /></span></div>
      <strong>{value}</strong>
      <div className={positive ? 'trend up' : 'trend down'}>
        <ArrowUpRight size={14} />{change}<em>vs yesterday</em>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [view, setView] = useState<'Overview' | 'Point of sale' | 'Products' | 'Inventory' | 'Purchasing' | 'Suppliers' | 'Sales' | 'Customers' | 'Reports' | 'AI Assistant' | 'Settings'>('Point of sale')
  const [mobileNav, setMobileNav] = useState(false)
  const [managementExpanded, setManagementExpanded] = useState(false)

  // Dashboard, Inventory, Suppliers & Sales data
  const [dashData, setDashData] = useState<any>(null)
  const [expiryItems, setExpiryItems] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [salesHistory, setSalesHistory] = useState<any[]>([])
  const [supplierSearch, setSupplierSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [salesSearch, setSalesSearch] = useState('')
  const [dashLoading, setDashLoading] = useState(true)

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false)
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)

  // POS state
  const [cart, setCart] = useState<{ product: any; qty: number }[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [payment, setPayment] = useState<'M-Pesa' | 'Cash' | 'Card'>('M-Pesa')
  const [phone, setPhone] = useState('')
  const [pushState, setPushState] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle')
  const [checkoutReceipt, setCheckoutReceipt] = useState('')
  const [discountVal, setDiscountVal] = useState('0')
  const [selectedCustPhone, setSelectedCustPhone] = useState('')
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)

  // Restricted management & profile menu states
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [isManagementUnlocked, setIsManagementUnlocked] = useState(false)
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false)
  const [adminPinInput, setAdminPinInput] = useState('')
  const [adminPinError, setAdminPinError] = useState('')
  const [pendingView, setPendingView] = useState<string | null>(null)

  // Payment settings states
  const [paybill, setPaybill] = useState('')
  const [till, setTill] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAcct, setBankAcct] = useState('')
  const [preferredMethod, setPreferredMethod] = useState<'PAYBILL' | 'TILL' | 'BANK'>('PAYBILL')
  const [settingsSaving, setSettingsSaving] = useState(false)

  // Header dropdown states
  const [headerNotifOpen, setHeaderNotifOpen] = useState(false)
  const [headerProfileOpen, setHeaderProfileOpen] = useState(false)

  // Search/Filter for Products & Inventory pages
  const [prodSearch, setProdSearch] = useState('')

  // AI Assistant
  const [aiQuery, setAiQuery] = useState('')
  const [aiChat, setAiChat] = useState<{ role: string; text: string }[]>([
    { role: 'assistant', text: 'Hello! Ask me anything about your sales, stock levels, or expiring batches.' }
  ])
  const [aiLoading, setAiLoading] = useState(false)

  const loadDashboard = useCallback(async () => {
    try {
      const [dash, expiry, prods, supps, custs, sales, paySettings] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/inventory/expiry-watch?days=60'),
        api.get('/products'),
        api.get('/suppliers'),
        api.get('/customers'),
        api.get('/sales/history?limit=50'),
        api.get('/analytics/settings/payments').catch(() => ({ data: { paybill: '', till: '', bank_name: '', bank_acct: '', preferred_method: 'PAYBILL' } }))
      ])
      setDashData(dash.data)
      setExpiryItems(expiry.data)
      setProducts(prods.data)
      setSuppliers(supps.data)
      setCustomers(custs.data)
      setSalesHistory(sales.data)
      if (paySettings && paySettings.data) {
        setPaybill(paySettings.data.paybill || '')
        setTill(paySettings.data.till || '')
        setBankName(paySettings.data.bank_name || '')
        setBankAcct(paySettings.data.bank_acct || '')
        setPreferredMethod(paySettings.data.preferred_method || 'PAYBILL')
      }
    } catch {
      router.push('/login')
    } finally {
      setDashLoading(false)
    }
  }, [router])

  const saveSettings = async () => {
    setSettingsSaving(true)
    try {
      await api.post('/analytics/settings/payments', {
        paybill: paybill,
        till: till,
        bank_name: bankName,
        bank_acct: bankAcct,
        preferred_method: preferredMethod
      })
      alert('Configurations and payment integrations saved securely!')
    } catch (err) {
      alert('Failed to save settings.')
    } finally {
      setSettingsSaving(false)
    }
  }

  useEffect(() => { loadDashboard() }, [loadDashboard])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target) return

      if (accountMenuOpen && !target.closest('.sidebar-account-container')) {
        setAccountMenuOpen(false)
      }
      if (headerNotifOpen && !target.closest('.header-notif-container')) {
        setHeaderNotifOpen(false)
      }
      if (headerProfileOpen && !target.closest('.header-profile-container')) {
        setHeaderProfileOpen(false)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [accountMenuOpen, headerNotifOpen, headerProfileOpen])


  useEffect(() => {
    if (view !== 'Point of sale') {
      setManagementExpanded(true)
    }
  }, [view])

  const handleViewChange = (newView: any) => {
    if (newView === 'Point of sale') {
      setView(newView)
      setMobileNav(false)
      return
    }

    if (!isManagementUnlocked) {
      setPendingView(newView)
      setIsAdminPinModalOpen(true)
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('pharma_user_email') : ''
      setAdminPinInput(userEmail === 'jane@abcchemist.co.ke' ? 'demouser' : '')
      setAdminPinError('')
    } else {
      setView(newView)
      setMobileNav(false)
    }
  }

  const handleManagementToggle = () => {
    if (managementExpanded) {
      setManagementExpanded(false)
    } else {
      if (!isManagementUnlocked) {
        setPendingView(null)
        setIsAdminPinModalOpen(true)
        const userEmail = typeof window !== 'undefined' ? localStorage.getItem('pharma_user_email') : ''
        setAdminPinInput(userEmail === 'jane@abcchemist.co.ke' ? 'demouser' : '')
        setAdminPinError('')
      } else {
        setManagementExpanded(true)
      }
    }
  }

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map((p: any) => p.category)))], [products])
  const filtered = useMemo(() => products.filter((p: any) =>
    (category === 'All' || p.category === category) &&
    `${p.name} ${p.sku}`.toLowerCase().includes(query.toLowerCase())
  ), [products, category, query])

  const filteredCatalog = useMemo(() => products.filter((p: any) =>
    `${p.name} ${p.sku} ${p.barcode || ''} ${p.category}`.toLowerCase().includes(prodSearch.toLowerCase())
  ), [products, prodSearch])

  const filteredSuppliers = useMemo(() => suppliers.filter((s: any) =>
    `${s.name} ${s.contact_person || ''} ${s.email || ''} ${s.phone || ''}`.toLowerCase().includes(supplierSearch.toLowerCase())
  ), [suppliers, supplierSearch])

  const filteredCustomers = useMemo(() => customers.filter((c: any) =>
    `${c.name} ${c.phone || ''} ${c.email || ''}`.toLowerCase().includes(customerSearch.toLowerCase())
  ), [customers, customerSearch])

  const filteredSales = useMemo(() => salesHistory.filter((s: any) =>
    `${s.receipt_number} ${s.cashier_name || ''} ${s.payment_method}`.toLowerCase().includes(salesSearch.toLowerCase())
  ), [salesHistory, salesSearch])

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + Number(i.product.selling_price) * i.qty, 0), [cart])

  const addToCart = (product: any) => {
    setCart(prev => {
      const found = prev.find(i => i.product.id === product.id)
      return found ? prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { product, qty: 1 }]
    })
  }

  const adjustCart = (id: string, delta: number) =>
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0))

  const handleCheckout = async () => {
    if (!cart.length) return
    const activePhone = payment === 'M-Pesa' ? phone : selectedCustPhone
    if (payment === 'M-Pesa' && !/^((\+254|0)[17]\d{8})$/.test(activePhone.replace(/\s/g, ''))) {
      setPushState('failed'); return
    }
    setPushState('pending')
    try {
      const disc = parseFloat(discountVal) || 0
      const res = await api.post('/sales/checkout', {
        items: cart.map(i => ({ product_id: i.product.id, quantity: i.qty, unit_price: Number(i.product.selling_price) })),
        discount: disc.toFixed(2),
        payment_method: payment,
        customer_phone: activePhone || undefined
      })
      setCheckoutReceipt(res.data.receipt_number)

      setReceiptData({
        receipt_number: res.data.receipt_number,
        payment_method: payment,
        date: new Date().toLocaleString('en-KE'),
        cashier: res.data.cashier_name || 'Jane Doe',
        customer: customers.find(c => c.phone === activePhone)?.name || 'Walk-in Customer',
        items: cart.map(i => ({
          name: i.product.name,
          qty: i.qty,
          price: Number(i.product.selling_price),
          total: Number(i.product.selling_price) * i.qty
        })),
        subtotal: cartTotal,
        discount: disc,
        total: cartTotal - disc
      })

      setPushState('success')
      setIsReceiptOpen(true)
      setCart([])
      setDiscountVal('0')
      setPhone('')
      setSelectedCustPhone('')
      loadDashboard()
    } catch {
      setPushState('failed')
    }
  }

  const sendAiQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiQuery.trim()) return
    const text = aiQuery
    setAiQuery('')
    setAiChat(prev => [...prev, { role: 'user', text }])
    setAiLoading(true)
    try {
      const res = await api.post('/analytics/ai/query', { prompt: text })
      setAiChat(prev => [...prev, { role: 'assistant', text: res.data.answer }])
    } catch {
      setAiChat(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setAiLoading(false)
    }
  }

  const handleLogout = () => { localStorage.removeItem('pharma_access_token'); router.push('/login') }

  if (dashLoading) {
    return (
      <div className="app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw size={22} className="spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  const d = dashData
  return (
    <div className="app-shell">

      {/* Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSuccess={loadDashboard}
      />
      <AddBatchModal
        isOpen={isAddBatchOpen}
        products={products}
        onClose={() => setIsAddBatchOpen(false)}
        onSuccess={loadDashboard}
      />
      <AddSupplierModal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        onSuccess={loadDashboard}
      />
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSuccess={loadDashboard}
      />

      {/* Receipt Modal */}
      {isReceiptOpen && receiptData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '360px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '16px', color: '#172321' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Pharma</h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted-foreground)' }}>ABC Chemist · Main Branch</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--muted-foreground)' }}>Nairobi, Kenya</p>
            </div>
            
            <div style={{ fontSize: '12px', display: 'grid', gap: '6px', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Receipt No:</span><b>{receiptData.receipt_number}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Date:</span><span>{receiptData.date}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cashier:</span><span>{receiptData.cashier}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Customer:</span><span>{receiptData.customer}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Payment:</span><span>{receiptData.payment_method}</span></div>
            </div>

            <div style={{ borderBottom: '1px dashed var(--border)', borderTop: '1px dashed var(--border)', padding: '12px 0', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {receiptData.items.map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div><b>{item.name}</b></div>
                    <small style={{ color: 'var(--muted-foreground)' }}>{item.qty} x {money.format(item.price)}</small>
                  </div>
                  <b>{money.format(item.total)}</b>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', textAlign: 'right' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><b>{money.format(receiptData.subtotal)}</b></div>
              {receiptData.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}><span>Discount</span><b>-{money.format(receiptData.discount)}</b></div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                <span>Total</span>
                <b>{money.format(receiptData.total)}</b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                className="primary"
                onClick={() => window.print()}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Print Receipt
              </button>
              <button
                onClick={() => setIsReceiptOpen(false)}
                style={{ flex: 1, border: '1px solid var(--border)', background: '#fff', borderRadius: '7px', fontWeight: 600, fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSuccess={loadDashboard}
      />

      {/* Admin Security PIN Modal */}
      {isAdminPinModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '320px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '16px', color: '#172321' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fae8e7', color: 'var(--danger)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                <Zap size={22} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Management Lock</h3>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--muted-foreground)' }}>Please enter the Admin PIN to access restricted back-office views.</p>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const userEmail = typeof window !== 'undefined' ? localStorage.getItem('pharma_user_email') : ''
              const isDemoUser = userEmail === 'jane@abcchemist.co.ke'
              const isValidPin = adminPinInput === '1234' || (isDemoUser && adminPinInput === 'demouser')

              if (isValidPin) {
                setIsManagementUnlocked(true)
                setIsAdminPinModalOpen(false)
                setManagementExpanded(true)
                if (pendingView) {
                  setView(pendingView as any)
                  setMobileNav(false)
                }
              } else {
                setAdminPinError(isDemoUser ? 'Incorrect PIN code. Hint: 1234 or demouser' : 'Incorrect PIN code. Hint: 1234')
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="password-field">
                <input
                  type="password"
                  value={adminPinInput}
                  onChange={e => { setAdminPinInput(e.target.value); setAdminPinError('') }}
                  placeholder="Enter PIN"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', outline: 'none', textAlign: 'center', letterSpacing: '4px', fontWeight: 600, background: '#fff', color: '#172321' }}
                  autoFocus
                />
              </div>

              {adminPinError && (
                <div style={{ color: 'var(--danger)', fontSize: '11px', textAlign: 'center', fontWeight: 600 }}>
                  {adminPinError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="submit"
                  className="primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Unlock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminPinModalOpen(false)
                    setPendingView(null)
                  }}
                  style={{ flex: 1, border: '1px solid var(--border)', background: '#fff', borderRadius: '7px', fontWeight: 600, fontSize: '13px', color: '#172321' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={mobileNav ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <span className="brand-mark"><Activity size={19} /></span>
          <span>Pharma</span>
          <button className="mobile-close" onClick={() => setMobileNav(false)}><X size={19} /></button>
        </div>
        <div className="branch">
          <span className="branch-icon"><Store size={16} /></span>
          <span><b>My Pharmacy</b><small>Main branch</small></span>
          <ChevronDown size={15} />
        </div>
        <nav>
          {/* 1. Point of sale (Top level) */}
          <button
            className={(view === 'Point of sale') ? 'nav-item active' : 'nav-item'}
            onClick={() => handleViewChange('Point of sale')}
          >
            <Calculator size={18} />
            <span>Point of sale</span>
          </button>

          {/* 2. Management Accordion Toggle */}
          <button
            className={(view !== 'Point of sale') ? 'nav-item active' : 'nav-item'}
            onClick={handleManagementToggle}
            style={{ display: 'flex', alignItems: 'center', width: '100%' }}
          >
            <Sliders size={18} />
            <span style={{ flex: 1 }}>Management</span>
            <ChevronDown
              size={15}
              style={{
                transition: 'transform 0.2s',
                transform: managementExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              }}
            />
          </button>

          {/* 3. Nested Management Menu */}
          {managementExpanded && (
            <div
              style={{
                marginLeft: '20px',
                paddingLeft: '10px',
                borderLeft: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                marginTop: '3px',
                marginBottom: '8px',
              }}
            >
              {MGMT_NAV.map(([label, Icon]) => (
                <button
                  key={label}
                  className={(view === label) ? 'nav-item active' : 'nav-item'}
                  onClick={() => handleViewChange(label as any)}
                  style={{
                    height: '36px',
                    padding: '6px 10px',
                    fontSize: '13px',
                  }}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                  {label === 'Inventory' && expiryItems.filter(i => i.status === 'CRITICAL').length > 0 && (
                    <i>{expiryItems.filter(i => i.status === 'CRITICAL').length}</i>
                  )}
                </button>
              ))}
            </div>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="help"><CircleHelp size={18} /><span><b>Need help?</b><small>Visit Help Center</small></span></div>
          <div className="sidebar-account-container" style={{ position: 'relative' }}>
            {accountMenuOpen && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '0',
                right: '0',
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 -10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                padding: '6px',
                marginBottom: '8px',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <button
                  onClick={() => {
                    alert("Profile Details:\n\nUser: jane@abcchemist.co.ke\nRole: Pharmacy Manager\nBranch: ABC Chemist Main Branch\nLoyalty System Status: Active")
                    setAccountMenuOpen(false)
                  }}
                  className="account-menu-item"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', border: 0, background: 'none', textAlign: 'left', fontSize: '12px', borderRadius: '5px', color: '#172321', cursor: 'pointer' }}
                >
                  <Users size={14} /> Profile
                </button>
                <button
                  onClick={() => {
                    handleViewChange('Settings')
                    setAccountMenuOpen(false)
                  }}
                  className="account-menu-item"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', border: 0, background: 'none', textAlign: 'left', fontSize: '12px', borderRadius: '5px', color: '#172321', cursor: 'pointer' }}
                >
                  <Settings size={14} /> Settings
                </button>
                <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                <button
                  onClick={handleLogout}
                  className="account-menu-item"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', border: 0, background: 'none', textAlign: 'left', fontSize: '12px', borderRadius: '5px', color: 'var(--danger)', cursor: 'pointer' }}
                >
                  <X size={14} /> Sign out
                </button>
              </div>
            )}
            <div
              className="profile"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px' }}
            >
              <span className="avatar">JE</span>
              <span><b>Jane Chemist</b><small>jane@abcchemist.co.ke</small></span>
              <ChevronDown size={15} style={{ transform: accountMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main">
        <header>
          <button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu size={21} /></button>
          <div>
            <p className="eyebrow">{new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <h1>
              {view === 'Overview' && 'Good day — Overview'}
              {view === 'Point of sale' && 'Point of sale'}
              {view === 'Products' && 'Products & Catalog'}
              {view === 'Inventory' && 'Inventory & FEFO Batches'}
              {view === 'Purchasing' && 'Purchasing & Stock Receiving'}
              {view === 'Suppliers' && 'Supplier Directory'}
              {view === 'Sales' && 'Sales Ledger & Transactions'}
              {view === 'Customers' && 'Customer Directory'}
              {view === 'Reports' && 'Financial & Tax Reports'}
              {view === 'AI Assistant' && 'AI Business Assistant'}
              {view === 'Settings' && 'Pharmacy Settings'}
            </h1>
          </div>
          <div className="header-actions">
            {/* Notifications Dropdown */}
            <div className="header-notif-container" style={{ position: 'relative' }}>
              <button
                className="icon-button"
                onClick={() => {
                  setHeaderNotifOpen(!headerNotifOpen)
                  setHeaderProfileOpen(false)
                }}
                style={{ border: 0, background: 'none', cursor: 'pointer', position: 'relative', display: 'grid', placeItems: 'center', height: '36px', width: '36px', borderRadius: '50%', color: '#667470' }}
              >
                <Bell size={19} />
                <i style={{ position: 'absolute', right: '4px', top: '4px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)' }} />
              </button>

              {headerNotifOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                  padding: '12px',
                  marginTop: '8px',
                  width: '280px',
                  zIndex: 60,
                  color: '#172321'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <b style={{ fontSize: '13px' }}>Notifications</b>
                    <span style={{ fontSize: '10px', background: '#fae8e7', color: 'var(--danger)', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>2 alerts</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid #f2f5f4', paddingBottom: '6px' }}>
                      <b style={{ color: 'var(--danger)' }}>Low Stock Warning</b>
                      <span>Paracetamol Extra is below safety margin (12 items left).</span>
                      <small style={{ color: 'var(--muted-foreground)' }}>10 mins ago</small>
                    </div>
                    <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <b style={{ color: 'var(--amber)' }}>FEFO Expiry Alert</b>
                      <span>Amoxicillin batch #AMX209 expires in 12 days.</span>
                      <small style={{ color: 'var(--muted-foreground)' }}>2 hours ago</small>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="header-profile-container" style={{ position: 'relative' }}>
              <div
                className="header-avatar"
                onClick={() => {
                  setHeaderProfileOpen(!headerProfileOpen)
                  setHeaderNotifOpen(false)
                }}
                style={{ cursor: 'pointer', display: 'grid', placeItems: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: '12px', fontWeight: 700 }}
              >
                JE
              </div>

              {headerProfileOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                  padding: '6px',
                  marginTop: '8px',
                  width: '180px',
                  zIndex: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  color: '#172321'
                }}>
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                    <b style={{ display: 'block', fontSize: '12px' }}>Jane Chemist</b>
                    <small style={{ display: 'block', fontSize: '10px', color: 'var(--muted-foreground)' }}>jane@abcchemist.co.ke</small>
                  </div>
                  <button
                    onClick={() => {
                      alert("Profile Details:\n\nUser: jane@abcchemist.co.ke\nRole: Pharmacy Manager\nBranch: ABC Chemist Main Branch")
                      setHeaderProfileOpen(false)
                    }}
                    className="account-menu-item"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', border: 0, background: 'none', textAlign: 'left', fontSize: '12px', borderRadius: '5px', color: '#172321', cursor: 'pointer' }}
                  >
                    <Users size={14} /> Profile
                  </button>
                  <button
                    onClick={() => {
                      handleViewChange('Settings')
                      setHeaderProfileOpen(false)
                    }}
                    className="account-menu-item"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', border: 0, background: 'none', textAlign: 'left', fontSize: '12px', borderRadius: '5px', color: '#172321', cursor: 'pointer' }}
                  >
                    <Settings size={14} /> Settings
                  </button>
                  <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                  <button
                    onClick={handleLogout}
                    className="account-menu-item"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', border: 0, background: 'none', textAlign: 'left', fontSize: '12px', borderRadius: '5px', color: 'var(--danger)', cursor: 'pointer' }}
                  >
                    <X size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* OVERVIEW TAB */}
        {view === 'Overview' && d && (
          <div className="content">
            <div className="welcome-row">
              <div><p className="muted">Here&apos;s what&apos;s happening at your pharmacy today.</p></div>
              <button className="primary" onClick={() => setView('Point of sale')}><Plus size={17} /> New sale</button>
            </div>
            <div className="metrics">
              <Metric label="Today's sales" value={d.todays_sales.value} change="live" icon={DollarSign} />
              <Metric label="Transactions" value={d.transactions_count.value} change="live" icon={Receipt} />
              <Metric label="M-Pesa volume" value={d.mpesa_volume.value} change="live" icon={Smartphone} />
              <Metric label="Gross profit" value={d.gross_profit.value} change="live" icon={BarChart3} />
            </div>
            <div className="dashboard-grid">
              <section className="panel sales-chart">
                <div className="panel-heading">
                  <div><h2>Sales overview</h2><p className="muted">7-day performance trend</p></div>
                </div>
                <div className="chart">
                  <div className="y-labels"><span>40k</span><span>30k</span><span>20k</span><span>10k</span><span>0</span></div>
                  <div className="chart-area">
                    <div className="grid-lines" />
                    <svg viewBox="0 0 600 220" preserveAspectRatio="none" aria-label="Sales trend">
                      <path d="M0 170 C45 145 70 155 100 120 S170 125 200 135 S270 100 300 122 S350 140 385 86 S440 110 470 80 S535 55 600 18" fill="none" stroke="#1d8b79" strokeWidth="3" />
                      <path d="M0 170 C45 145 70 155 100 120 S170 125 200 135 S270 100 300 122 S350 140 385 86 S440 110 470 80 S535 55 600 18 V220 H0Z" fill="url(#fade)" opacity=".18" />
                      <defs><linearGradient id="fade" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#1d8b79" /><stop offset="1" stopColor="#1d8b79" stopOpacity="0" /></linearGradient></defs>
                    </svg>
                    <div className="x-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                  </div>
                </div>
              </section>

              <section className="panel">
                <div className="panel-heading">
                  <div><h2>Inventory alerts</h2><p className="muted">Items needing attention</p></div>
                </div>
                <div className="alert-list">
                  {expiryItems.filter(i => i.status === 'CRITICAL').length > 0 && (
                    <div className="alert-item">
                      <span className="alert-icon red"><AlertTriangle size={17} /></span>
                      <span><b>{expiryItems.filter(i => i.status === 'CRITICAL').length} items critically expiring</b><small>Expire within 14 days</small></span>
                    </div>
                  )}
                  {expiryItems.filter(i => i.status === 'WARNING').length > 0 && (
                    <div className="alert-item">
                      <span className="alert-icon amber"><RefreshCw size={17} /></span>
                      <span><b>{expiryItems.filter(i => i.status === 'WARNING').length} expiring this month</b><small>Expire within 30 days</small></span>
                    </div>
                  )}
                  {expiryItems.length === 0 && (
                    <div className="alert-item">
                      <span className="alert-icon" style={{ background: '#eaf5e3', color: '#54945c' }}><Check size={17} /></span>
                      <span><b>No urgent expiry alerts</b><small>All batches are within safe range</small></span>
                    </div>
                  )}
                </div>
              </section>

              <section className="panel expiry">
                <div className="panel-heading">
                  <div><h2>Expiry watch (FEFO)</h2><p className="muted">Batches approaching expiry</p></div>
                  <button className="text-button" onClick={() => setView('Inventory')}>View Inventory <ArrowUpRight size={14} /></button>
                </div>
                <table>
                  <thead><tr><th>Product</th><th>Batch</th><th>Expiry date</th><th>Qty</th><th>Status</th></tr></thead>
                  <tbody>
                    {expiryItems.slice(0, 5).map((item, i) => (
                      <tr key={i}>
                        <td><span className="table-product"><span className="mini-pack">{item.product_name[0]}</span><b>{item.product_name}</b></span></td>
                        <td>{item.batch_number}</td>
                        <td>{item.expiry_date}</td>
                        <td>{item.quantity_remaining}</td>
                        <td><span className={`status ${item.status.toLowerCase()}`}>{item.status}</span></td>
                      </tr>
                    ))}
                    {expiryItems.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted-foreground)', padding: '18px' }}>No expiring batches found</td></tr>
                    )}
                  </tbody>
                </table>
              </section>

              <section className="panel payment-breakdown">
                <div className="panel-heading"><div><h2>Payment breakdown</h2><p className="muted">Today&apos;s collected payments</p></div></div>
                <div className="donut-wrap">
                  <div className="donut"><strong>{d.todays_sales.value.replace('KES ', '')}</strong><small>Total</small></div>
                  <div className="legend">
                    <span><i className="teal" />M-Pesa <b>{d.mpesa_volume.value}</b></span>
                    <span><i className="navy" />Cash <b>KES 0</b></span>
                    <span><i className="gold" />Card <b>KES 0</b></span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {view === 'Products' && (
          <div className="content">
            <div className="welcome-row">
              <div>
                <p className="muted">Manage your pharmacy product catalog and pricing.</p>
              </div>
              <button className="primary" onClick={() => setIsAddProductOpen(true)}>
                <Plus size={17} /> Add Product
              </button>
            </div>

            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="search" style={{ maxWidth: '320px' }}>
                  <Search size={17} />
                  <input
                    value={prodSearch}
                    onChange={e => setProdSearch(e.target.value)}
                    placeholder="Search by name, SKU, barcode..."
                  />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                  Total: <b>{filteredCatalog.length}</b> products
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--muted-foreground)' }}>
                      <th style={{ padding: '10px' }}>Product</th>
                      <th style={{ padding: '10px' }}>SKU</th>
                      <th style={{ padding: '10px' }}>Category</th>
                      <th style={{ padding: '10px' }}>Price (KES)</th>
                      <th style={{ padding: '10px' }}>Buying Price</th>
                      <th style={{ padding: '10px' }}>Total Stock</th>
                      <th style={{ padding: '10px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCatalog.map(p => {
                      const imgUrl = p.name.includes('Amoxicillin') ? '/products/amoxicillin.png' :
                                     p.name.includes('Paracetamol') ? '/products/paracetamol.png' :
                                     p.name.includes('Omeprazole') ? '/products/omeprazole.png' : null
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 10px' }}>
                            <span className="table-product">
                              <span className="mini-pack" style={{ overflow: 'hidden', padding: 2, background: '#f7fbf9' }}>
                                {imgUrl ? <img src={imgUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 4 }} /> : p.name[0]}
                              </span>
                              <div>
                                <b>{p.name}</b>
                                {p.generic_name && <small style={{ display: 'block', color: 'var(--muted-foreground)' }}>{p.generic_name}</small>}
                              </div>
                            </span>
                          </td>
                          <td style={{ padding: '10px' }}>{p.sku}</td>
                          <td style={{ padding: '10px' }}><span className="category" style={{ padding: '3px 8px' }}>{p.category}</span></td>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{money.format(Number(p.selling_price))}</td>
                        <td style={{ padding: '10px', color: 'var(--muted-foreground)' }}>{p.buying_price ? money.format(Number(p.buying_price)) : '-'}</td>
                        <td style={{ padding: '10px' }}>
                          <b style={{ color: p.total_stock < p.reorder_level ? 'var(--danger)' : 'inherit' }}>
                            {p.total_stock} {p.unit}s
                          </b>
                        </td>
                        <td style={{ padding: '10px' }}>
                          <button onClick={() => setIsAddBatchOpen(true)} style={{ border: 0, background: '#e7f4f0', color: 'var(--primary)', padding: '5px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Plus size={13} /> Stock Batch
                          </button>
                        </td>
                      </tr>
                      )
                    })}
                    {filteredCatalog.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted-foreground)' }}>
                          No products found in catalog. Click &quot;Add Product&quot; to add your first item.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PURCHASING TAB */}
        {view === 'Purchasing' && (
          <div className="content">
            <div className="welcome-row">
              <div>
                <p className="muted">Manage pharmaceutical purchase orders, stock receiving, and supplier deliveries.</p>
              </div>
              <button className="primary" onClick={() => setIsAddBatchOpen(true)}>
                <Plus size={17} /> New Stock Receiving (Batch)
              </button>
            </div>

            <div className="dashboard-grid">
              <section className="panel" style={{ gridColumn: '1 / -1' }}>
                <div className="panel-heading">
                  <div>
                    <h2>Stock Receiving & Inward Batches</h2>
                    <p className="muted">Log incoming supplier stock directly into FEFO inventory</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '14px' }}>
                  <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '18px', background: '#fcfdfd' }}>
                    <span className="icon-box" style={{ marginBottom: '12px' }}><Truck size={20} /></span>
                    <h3 style={{ fontSize: '15px', margin: '0 0 6px 0', fontWeight: 700 }}>Direct Batch Inwarding</h3>
                    <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: '0 0 16px 0' }}>Receive stock from verified distributors and assign batch numbers and expiry dates.</p>
                    <button className="primary" style={{ width: '100%', fontSize: '12px' }} onClick={() => setIsAddBatchOpen(true)}>
                      <Plus size={15} /> Receive Batch
                    </button>
                  </div>

                  <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '18px', background: '#fcfdfd' }}>
                    <span className="icon-box" style={{ marginBottom: '12px' }}><ClipboardList size={20} /></span>
                    <h3 style={{ fontSize: '15px', margin: '0 0 6px 0', fontWeight: 700 }}>Supplier Management</h3>
                    <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: '0 0 16px 0' }}>View distributor contact details, pending purchase orders, and payment history.</p>
                    <button onClick={() => setView('Suppliers')} style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', background: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                      Manage Suppliers ({suppliers.length})
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* SALES TAB */}
        {view === 'Sales' && (
          <div className="content">
            <div className="welcome-row">
              <div>
                <p className="muted">Audit complete transaction history, receipt ledgers, and cashier sales performance.</p>
              </div>
              <button className="primary" onClick={() => setView('Point of sale')}>
                <Plus size={17} /> New Sale
              </button>
            </div>

            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="search" style={{ maxWidth: '320px' }}>
                  <Search size={17} />
                  <input
                    value={salesSearch}
                    onChange={e => setSalesSearch(e.target.value)}
                    placeholder="Search receipt #, cashier..."
                  />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                  Showing <b>{filteredSales.length}</b> transactions
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--muted-foreground)' }}>
                      <th style={{ padding: '10px' }}>Receipt #</th>
                      <th style={{ padding: '10px' }}>Date & Time</th>
                      <th style={{ padding: '10px' }}>Cashier</th>
                      <th style={{ padding: '10px' }}>Payment Method</th>
                      <th style={{ padding: '10px' }}>Total Amount</th>
                      <th style={{ padding: '10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 10px', fontFamily: 'monospace', fontWeight: 600 }}>{s.receipt_number}</td>
                        <td style={{ padding: '10px', color: 'var(--muted-foreground)' }}>
                          {new Date(s.created_at).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '10px' }}>{s.cashier_name || 'Cashier'}</td>
                        <td style={{ padding: '10px' }}>
                          <span className="category" style={{ padding: '3px 8px' }}>{s.payment_method}</span>
                        </td>
                        <td style={{ padding: '10px', fontWeight: 700 }}>{money.format(Number(s.total_amount))}</td>
                        <td style={{ padding: '10px' }}>
                          <span className="status watch" style={{ textTransform: 'uppercase' }}>
                            {s.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredSales.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted-foreground)' }}>
                          No sales transactions logged yet. Complete a checkout in Point of Sale.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {view === 'Customers' && (
          <div className="content">
            <div className="welcome-row">
              <div>
                <p className="muted">Manage pharmacy patient & customer profiles and loyalty points.</p>
              </div>
              <button className="primary" onClick={() => setIsAddCustomerOpen(true)}>
                <Plus size={17} /> Register Customer
              </button>
            </div>

            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="search" style={{ maxWidth: '320px' }}>
                  <Search size={17} />
                  <input
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Search customer name, phone..."
                  />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                  Total: <b>{filteredCustomers.length}</b> customers
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--muted-foreground)' }}>
                      <th style={{ padding: '10px' }}>Customer Name</th>
                      <th style={{ padding: '10px' }}>Phone Number</th>
                      <th style={{ padding: '10px' }}>Email</th>
                      <th style={{ padding: '10px' }}>Loyalty Points</th>
                      <th style={{ padding: '10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 10px' }}>
                          <span className="table-product">
                            <span className="mini-pack">{c.name[0]}</span>
                            <b>{c.name}</b>
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>{c.phone || '-'}</td>
                        <td style={{ padding: '10px' }}>{c.email || '-'}</td>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{c.loyalty_points} pts</td>
                        <td style={{ padding: '10px' }}>
                          <span className="status watch" style={{ textTransform: 'uppercase' }}>
                            {c.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted-foreground)' }}>
                          No customer profiles found. Click &quot;Register Customer&quot; to add your first patient/customer.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUPPLIERS TAB */}
        {view === 'Suppliers' && (
          <div className="content">
            <div className="welcome-row">
              <div>
                <p className="muted">Manage pharmaceutical distributors, wholesalers, and supplier accounts.</p>
              </div>
              <button className="primary" onClick={() => setIsAddSupplierOpen(true)}>
                <Plus size={17} /> Add Supplier
              </button>
            </div>

            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="search" style={{ maxWidth: '320px' }}>
                  <Search size={17} />
                  <input
                    value={supplierSearch}
                    onChange={e => setSupplierSearch(e.target.value)}
                    placeholder="Search by company name, email..."
                  />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                  Total: <b>{filteredSuppliers.length}</b> suppliers
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--muted-foreground)' }}>
                      <th style={{ padding: '10px' }}>Company Name</th>
                      <th style={{ padding: '10px' }}>Contact Person</th>
                      <th style={{ padding: '10px' }}>Phone</th>
                      <th style={{ padding: '10px' }}>Email</th>
                      <th style={{ padding: '10px' }}>Address</th>
                      <th style={{ padding: '10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 10px' }}>
                          <span className="table-product">
                            <span className="mini-pack">{s.name[0]}</span>
                            <b>{s.name}</b>
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>{s.contact_person || '-'}</td>
                        <td style={{ padding: '10px' }}>{s.phone || '-'}</td>
                        <td style={{ padding: '10px' }}>{s.email || '-'}</td>
                        <td style={{ padding: '10px' }}>{s.address || '-'}</td>
                        <td style={{ padding: '10px' }}>
                          <span className="status watch" style={{ textTransform: 'uppercase' }}>
                            {s.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredSuppliers.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted-foreground)' }}>
                          No suppliers registered. Click &quot;Add Supplier&quot; to add your first pharmaceutical distributor.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {view === 'Inventory' && (
          <div className="content">
            <div className="welcome-row">
              <div>
                <p className="muted">Track stock batches, FEFO expiry dates, and warehouse receipts.</p>
              </div>
              <button className="primary" onClick={() => setIsAddBatchOpen(true)}>
                <Plus size={17} /> Add Stock Batch
              </button>
            </div>

            <div className="panel expiry" style={{ width: '100%', marginBottom: '24px' }}>
              <div className="panel-heading" style={{ marginBottom: '16px' }}>
                <div>
                  <h2>FEFO Expiry Watch</h2>
                  <p className="muted">Batches sorted by earliest expiration date first</p>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--muted-foreground)' }}>
                    <th style={{ padding: '10px' }}>Product</th>
                    <th style={{ padding: '10px' }}>Batch Number</th>
                    <th style={{ padding: '10px' }}>Expiry Date</th>
                    <th style={{ padding: '10px' }}>Days Left</th>
                    <th style={{ padding: '10px' }}>Qty Remaining</th>
                    <th style={{ padding: '10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expiryItems.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 10px' }}>
                        <span className="table-product">
                          <span className="mini-pack">{item.product_name[0]}</span>
                          <div>
                            <b>{item.product_name}</b>
                            <small style={{ display: 'block', color: 'var(--muted-foreground)' }}>{item.sku}</small>
                          </div>
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontFamily: 'monospace' }}>{item.batch_number}</td>
                      <td style={{ padding: '10px' }}>{new Date(item.expiry_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{item.days_to_expiry} days</td>
                      <td style={{ padding: '10px', fontWeight: 700 }}>{item.quantity_remaining}</td>
                      <td style={{ padding: '10px' }}>
                        <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
                      </td>
                    </tr>
                  ))}
                  {expiryItems.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted-foreground)' }}>
                        No batches expiring in the next 60 days. Stock status is healthy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* POS TAB */}
        {view === 'Point of sale' && (
          <div className="pos-content">
            <div className="pos-toolbar">
              <div><p className="muted">Create a new transaction</p></div>
              <span className="register"><span className="pulse" /> Register 01 · Online</span>
            </div>
            <div className="pos-grid">
              <section className="products-panel">
                <div className="search-row">
                  <div className="search">
                    <Search size={17} />
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products or scan barcode..." />
                    <span>⌘ K</span>
                  </div>
                </div>
                <div className="categories">
                  {categories.map(c => (
                    <button key={c} className={category === c ? 'category active' : 'category'} onClick={() => setCategory(c)}>{c}</button>
                  ))}
                </div>
                <div className="product-grid">
                  {filtered.map((p: any) => {
                    const imgUrl = p.name.includes('Amoxicillin') ? '/products/amoxicillin.png' :
                                   p.name.includes('Paracetamol') ? '/products/paracetamol.png' :
                                   p.name.includes('Omeprazole') ? '/products/omeprazole.png' : null
                    return (
                      <button className="product-card" key={p.id} onClick={() => addToCart(p)}>
                        <div className="product-image" style={{ background: '#f7fbf9', overflow: 'hidden', padding: 4 }}>
                          {imgUrl ? (
                            <img src={imgUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 4 }} />
                          ) : (
                            <span>{p.name[0]}</span>
                          )}
                        </div>
                        <div className="product-info">
                          <b>{p.name}</b>
                          <small>{p.sku} · {p.unit}</small>
                          <strong>{money.format(Number(p.selling_price))}</strong>
                          <em className={p.total_stock < 15 ? 'low' : ''}>{p.total_stock} in stock</em>
                        </div>
                        <span className="add-product"><Plus size={16} /></span>
                      </button>
                    )
                  })}
                  {filtered.length === 0 && (
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 12, gridColumn: '1/-1', padding: '20px 0' }}>No products found. Add products first.</p>
                  )}
                </div>
              </section>

              <aside className="cart-panel">
                <div className="cart-heading">
                  <span><h2>Current sale</h2><small>{cart.reduce((s, i) => s + i.qty, 0)} items</small></span>
                  <button onClick={() => { setCart([]); setPushState('idle') }} className="clear">Clear</button>
                </div>
                <div className="cart-items">
                  {cart.map(item => {
                    const imgUrl = item.product.name.includes('Amoxicillin') ? '/products/amoxicillin.png' :
                                   item.product.name.includes('Paracetamol') ? '/products/paracetamol.png' :
                                   item.product.name.includes('Omeprazole') ? '/products/omeprazole.png' : null
                    return (
                      <div className="cart-item" key={item.product.id}>
                        <div className="cart-thumb" style={{ background: '#f7fbf9', overflow: 'hidden', padding: 2 }}>
                          {imgUrl ? (
                            <img src={imgUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 4 }} />
                          ) : (
                            item.product.name[0]
                          )}
                        </div>
                        <div className="cart-item-info">
                          <b>{item.product.name}</b>
                          <small>{money.format(Number(item.product.selling_price))} each</small>
                          <div className="qty">
                            <button onClick={() => adjustCart(item.product.id, -1)}>−</button>
                            <span>{item.qty}</span>
                            <button onClick={() => adjustCart(item.product.id, 1)}>+</button>
                          </div>
                        </div>
                        <strong>{money.format(Number(item.product.selling_price) * item.qty)}</strong>
                      </div>
                    )
                  })}
                </div>
                 <div className="totals">
                  <span>Subtotal <b>{money.format(cartTotal)}</b></span>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    Discount (KES)
                    <input
                      type="number"
                      value={discountVal}
                      onChange={e => setDiscountVal(e.target.value)}
                      style={{ width: '70px', padding: '3px 6px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', textAlign: 'right', outline: 'none', background: '#fff', color: '#172321' }}
                      min="0"
                      max={cartTotal}
                    />
                  </span>
                  <span className="grand">Total <b>{money.format(Math.max(0, cartTotal - (parseFloat(discountVal) || 0)))}</b></span>
                </div>

                <div className="phone-field" style={{ marginBottom: 12 }}>
                  <label>Assign Customer (Optional)</label>
                  <div>
                    <select
                      value={selectedCustPhone}
                      onChange={e => {
                        const val = e.target.value
                        setSelectedCustPhone(val)
                        if (val) setPhone(val)
                      }}
                      style={{ width: '100%', padding: '9px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', background: '#fff', color: '#172321', outline: 'none' }}
                    >
                      <option value="">Walk-in Customer (None)</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.phone}>{c.name} ({c.phone})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="payment-tabs">
                  {(['M-Pesa', 'Cash', 'Card'] as const).map(p => {
                    const isMpesa = p === 'M-Pesa'
                    const tabLabel = isMpesa 
                      ? (preferredMethod === 'PAYBILL' ? 'M-Pesa Paybill' : preferredMethod === 'TILL' ? 'M-Pesa Till' : 'Bank Transfer')
                      : p
                    return (
                      <button key={p} className={payment === p ? 'payment-tab active' : 'payment-tab'} onClick={() => setPayment(p)}>
                        {isMpesa && <Smartphone size={15} />}
                        {p === 'Cash' && <DollarSign size={15} />}
                        {p === 'Card' && <Receipt size={15} />}
                        {tabLabel}
                      </button>
                    )
                  })}
                </div>

                {payment === 'M-Pesa' && (
                  <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {preferredMethod === 'PAYBILL' && (
                      <>
                        <div style={{ fontSize: '11px', color: '#0f766e', fontWeight: 600 }}>📡 ACTIVE METHOD: M-PESA PAYBILL</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          Paybill: <strong>{paybill || 'Not Set'}</strong> | Ref: <strong>{till || 'Not Set'}</strong>
                        </div>
                        <div className="phone-field" style={{ marginTop: '4px' }}>
                          <label>Customer phone number</label>
                          <div>
                            <Smartphone size={16} />
                            <input value={phone} onChange={e => { setPhone(e.target.value); setPushState('idle') }} placeholder="07XX XXX XXX" />
                          </div>
                        </div>
                      </>
                    )}

                    {preferredMethod === 'TILL' && (
                      <>
                        <div style={{ fontSize: '11px', color: '#0f766e', fontWeight: 600 }}>📡 ACTIVE METHOD: M-PESA TILL</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          Till Number: <strong>{till || 'Not Set'}</strong>
                        </div>
                        <div className="phone-field" style={{ marginTop: '4px' }}>
                          <label>Customer phone number (STK Push)</label>
                          <div>
                            <Smartphone size={16} />
                            <input value={phone} onChange={e => { setPhone(e.target.value); setPushState('idle') }} placeholder="07XX XXX XXX" />
                          </div>
                        </div>
                      </>
                    )}

                    {preferredMethod === 'BANK' && (
                      <>
                        <div style={{ fontSize: '11px', color: '#0f766e', fontWeight: 600 }}>📡 ACTIVE METHOD: BANK TRANSFER</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          Bank: <strong>{bankName || 'Not Set'}</strong> | Account: <strong>{bankAcct || 'Not Set'}</strong>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontStyle: 'italic', marginTop: '4px' }}>
                          Please ask the customer to transfer KES {money.format(Math.max(0, cartTotal - (parseFloat(discountVal) || 0)))} to the bank account above before completing the sale.
                        </div>
                      </>
                    )}
                  </div>
                )}

                {pushState === 'success' ? (
                  <div className="push-result success">
                    <span><Check size={17} /></span>
                    <div><b>Sale complete!</b><small>Receipt: {checkoutReceipt}</small></div>
                    <button onClick={() => setPushState('idle')}><X size={15} /></button>
                  </div>
                ) : pushState === 'failed' ? (
                  <div className="push-result failed">
                    <span><AlertTriangle size={17} /></span>
                    <div><b>Checkout failed</b><small>{payment === 'M-Pesa' && preferredMethod !== 'BANK' ? 'Check phone number format.' : 'Please check stock availability.'}</small></div>
                    <button onClick={() => setPushState('idle')}><X size={15} /></button>
                  </div>
                ) : (
                  <button className="checkout" onClick={handleCheckout} disabled={!cart.length || pushState === 'pending'}>
                    {pushState === 'pending'
                      ? <><RefreshCw size={17} className="spin" /> Processing...</>
                      : (
                        <>
                          {payment === 'M-Pesa' ? (
                            preferredMethod === 'BANK' ? (
                              <><Check size={17} /> Confirm Bank Transfer</>
                            ) : (
                              <><Smartphone size={17} /> Send STK Push</>
                            )
                          ) : (
                            <><Check size={17} /> Complete sale</>
                          )}{' · '}{money.format(Math.max(0, cartTotal - (parseFloat(discountVal) || 0)))}
                        </>
                      )
                    }
                  </button>
                )}
              </aside>
            </div>
          </div>
        )}

        {/* AI ASSISTANT TAB */}
        {view === 'AI Assistant' && (
          <div className="content">
            <div className="welcome-row">
              <div><p className="muted">Ask questions about your pharmacy in plain English.</p></div>
            </div>
            <div className="panel" style={{ maxWidth: 680 }}>
              <div className="panel-heading" style={{ marginBottom: 16 }}>
                <div><h2>Pharma AI Business Copilot</h2><p className="muted">Powered by live data from your database</p></div>
                <Sparkles size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <div style={{ background: '#f7f9f8', borderRadius: 8, padding: 16, minHeight: 280, maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {aiChat.map((msg, i) => (
                  <div key={i} style={{
                    padding: '10px 13px', borderRadius: 8, fontSize: 13, lineHeight: 1.5,
                    background: msg.role === 'user' ? '#dff2ed' : '#fff',
                    border: '1px solid',
                    borderColor: msg.role === 'user' ? '#c5e4dc' : 'var(--border)',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}>
                    {msg.text}
                  </div>
                ))}
                {aiLoading && <div style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Thinking…</div>}
              </div>
              <form onSubmit={sendAiQuery} style={{ display: 'flex', gap: 8 }}>
                <div className="search" style={{ flex: 1 }}>
                  <Search size={17} />
                  <input value={aiQuery} onChange={e => setAiQuery(e.target.value)} placeholder="e.g. What products are expiring this month?" />
                </div>
                <button className="primary" type="submit" disabled={aiLoading}>
                  {aiLoading ? <RefreshCw size={17} className="spin" /> : 'Ask'}
                </button>
              </form>
              <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 8 }}>
                Try: &ldquo;What&apos;s expiring soon?&rdquo; · &ldquo;Which products need restocking?&rdquo; · &ldquo;Today&apos;s sales summary&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {view === 'Reports' && (
          <div className="content">
            <div className="welcome-row">
              <div>
                <p className="muted">Detailed financial breakdowns, sales analytics, and FEFO inventory performance reports.</p>
              </div>
              <button className="primary" onClick={() => window.print()}>
                <FileText size={17} /> Export PDF Report
              </button>
            </div>

            <div className="dashboard-grid">
              <div className="card">
                <span className="icon-box"><TrendingUp size={18} /></span>
                <div>
                  <span className="card-title">Gross Revenue (Today)</span>
                  <div className="card-value">{dashData ? money.format(dashData.todays_sales.raw_number) : 'KES 0'}</div>
                  <span className="card-sub text-green">↑ {dashData?.todays_sales?.change || '0%'} vs yesterday</span>
                </div>
              </div>

              <div className="card">
                <span className="icon-box"><ShoppingBag size={18} /></span>
                <div>
                  <span className="card-title">Completed Orders</span>
                  <div className="card-value">{dashData ? dashData.transactions_count.value : '0'}</div>
                  <span className="card-sub text-green">↑ {dashData?.transactions_count?.change || '0%'} vs yesterday</span>
                </div>
              </div>

              <div className="card">
                <span className="icon-box"><Smartphone size={18} /></span>
                <div>
                  <span className="card-title">M-Pesa Collections</span>
                  <div className="card-value">{dashData ? money.format(dashData.mpesa_volume.raw_number) : 'KES 0'}</div>
                  <span className="card-sub text-green">↑ {dashData?.mpesa_volume?.change || '0%'} digital payments</span>
                </div>
              </div>

              <div className="card">
                <span className="icon-box"><PieChart size={18} /></span>
                <div>
                  <span className="card-title">Gross Profit Margin</span>
                  <div className="card-value">{dashData ? money.format(dashData.gross_profit.raw_number) : 'KES 0'}</div>
                  <span className="card-sub text-green">↑ {dashData?.gross_profit?.change || '0%'} net margin</span>
                </div>
              </div>

              <section className="panel" style={{ gridColumn: '1 / -1' }}>
                <div className="panel-heading">
                  <div>
                    <h2>Sales Channel Breakdown</h2>
                    <p className="muted">Distribution of payment channels across cash vs M-Pesa</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
                  <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', background: '#fcfdfd' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>M-Pesa STK Push</div>
                    <div style={{ fontSize: '20px', fontWeight: 700 }}>{dashData ? money.format(dashData.mpesa_volume.raw_number) : 'KES 0'}</div>
                  </div>
                  <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', background: '#fcfdfd' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>Cash Payments</div>
                    <div style={{ fontSize: '20px', fontWeight: 700 }}>
                      {dashData ? money.format(dashData.todays_sales.raw_number - dashData.mpesa_volume.raw_number) : 'KES 0'}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {view === 'Settings' && (
          <div className="content">
            <div className="welcome-row">
              <div>
                <p className="muted">Configure pharmacy profile, branch locations, and system preferences.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div className="panel" style={{ flex: '1 1 400px' }}>
                <div className="panel-heading" style={{ marginBottom: '20px' }}>
                  <div>
                    <h2>Pharmacy Profile & Preferences</h2>
                    <p className="muted">Tenant & POS system configurations</p>
                  </div>
                  <Sliders size={20} style={{ color: 'var(--primary)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Pharmacy Enterprise Name</label>
                    <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} defaultValue="Pharma Enterprise" />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Operating Currency</label>
                    <input style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} defaultValue="KES (Kenyan Shilling)" disabled />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Default Expiry Watch Threshold (Days)</label>
                    <input type="number" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} defaultValue={60} />
                  </div>
                </div>
              </div>

              <div className="panel" style={{ flex: '1 1 400px' }}>
                <div className="panel-heading" style={{ marginBottom: '20px' }}>
                  <div>
                    <h2>🔒 B2B Payment Integration</h2>
                    <p className="muted" style={{ color: '#0f766e', fontWeight: 500 }}>Active settlement channel selection</p>
                  </div>
                  <Lock size={20} style={{ color: '#0f766e' }} />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', padding: '4px', background: '#f1f5f9', borderRadius: '8px' }}>
                  <button 
                    type="button"
                    onClick={() => setPreferredMethod('PAYBILL')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      background: preferredMethod === 'PAYBILL' ? '#fff' : 'transparent',
                      color: preferredMethod === 'PAYBILL' ? '#0f766e' : 'var(--muted-foreground)',
                      boxShadow: preferredMethod === 'PAYBILL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    M-Pesa Paybill
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPreferredMethod('TILL')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      background: preferredMethod === 'TILL' ? '#fff' : 'transparent',
                      color: preferredMethod === 'TILL' ? '#0f766e' : 'var(--muted-foreground)',
                      boxShadow: preferredMethod === 'TILL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    M-Pesa Till
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPreferredMethod('BANK')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      background: preferredMethod === 'BANK' ? '#fff' : 'transparent',
                      color: preferredMethod === 'BANK' ? '#0f766e' : 'var(--muted-foreground)',
                      boxShadow: preferredMethod === 'BANK' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Bank Transfer
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {preferredMethod === 'PAYBILL' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>M-Pesa Paybill Business Number</label>
                        <input 
                          type="text" 
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} 
                          value={paybill} 
                          onChange={(e) => setPaybill(e.target.value)} 
                          placeholder="e.g. 552800"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Business Account Reference / Name</label>
                        <input 
                          type="text" 
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} 
                          value={till} 
                          onChange={(e) => setTill(e.target.value)} 
                          placeholder="e.g. ABCCHEMIST"
                        />
                      </div>
                    </>
                  )}

                  {preferredMethod === 'TILL' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>M-Pesa Buy Goods Till Number</label>
                      <input 
                        type="text" 
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} 
                        value={till} 
                        onChange={(e) => setTill(e.target.value)} 
                        placeholder="e.g. 993322"
                      />
                    </div>
                  )}

                  {preferredMethod === 'BANK' && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Settlement Bank Name</label>
                        <input 
                          type="text" 
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} 
                          value={bankName} 
                          onChange={(e) => setBankName(e.target.value)} 
                          placeholder="e.g. Equity Bank, KCB"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Bank Account Number</label>
                        <input 
                          type="password" 
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} 
                          value={bankAcct} 
                          onChange={(e) => setBankAcct(e.target.value)} 
                          placeholder="e.g. 1234567890"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', maxWidth: '864px' }}>
              <button className="primary" onClick={saveSettings} disabled={settingsSaving}>
                {settingsSaving ? 'Saving...' : 'Save All Configurations'}
              </button>
            </div>
          </div>
        )}

        {/* FALLBACK FOR OTHER VIEWS */}
        {!['Overview', 'Point of sale', 'Products', 'Inventory', 'Purchasing', 'Suppliers', 'Sales', 'Customers', 'Reports', 'AI Assistant', 'Settings'].includes(view) && (
          <div className="content">
            <div className="panel" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <span className="icon-box" style={{ margin: '0 auto 16px', width: 44, height: 44 }}>
                <Boxes size={24} />
              </span>
              <h2 style={{ fontSize: 18, marginBottom: 6 }}>{view} Workspace</h2>
              <p className="muted" style={{ maxWidth: 400, margin: '0 auto 20px' }}>
                This section is configured and ready for live module integration.
              </p>
              <button className="primary" style={{ margin: '0 auto' }} onClick={() => setView('Overview')}>
                Return to Overview
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
