'use client'

import { useState } from 'react'
import { X, Package, AlertCircle } from 'lucide-react'
import api from '@/lib/api'

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    generic_name: '',
    category: 'General',
    unit: 'Pack',
    reorder_level: 10,
    selling_price: '',
    buying_price: '',
    tax_rate: 0
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/products', {
        ...form,
        selling_price: parseFloat(form.selling_price) || 0,
        buying_price: parseFloat(form.buying_price) || 0,
        reorder_level: parseInt(String(form.reorder_level)) || 0,
        tax_rate: parseFloat(String(form.tax_rate)) || 0
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#fff', border: '1px solid var(--border)', borderRadius: '12px',
        width: '100%', maxWidth: '540px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="icon-box"><Package size={18} /></span>
            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 700 }}>Add New Product</h2>
          </div>
          <button onClick={onClose} style={{ border: 0, background: 'none', color: 'var(--muted-foreground)' }}><X size={18} /></button>
        </div>

        {error && (
          <div style={{ background: '#fae8e7', border: '1px solid #f0c4c2', color: '#b94b48', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Product Name *</label>
            <input required style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} placeholder="e.g. Amoxicillin 500mg" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>SKU *</label>
            <input required style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} placeholder="AMX-500" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Barcode</label>
            <input style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} placeholder="69103001..." value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Category</label>
            <input style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} placeholder="Antibiotics" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Unit Type</label>
            <input style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} placeholder="Capsule / Pack" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Selling Price (KES) *</label>
            <input required type="number" step="0.01" style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} placeholder="450.00" value={form.selling_price} onChange={e => setForm({ ...form, selling_price: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Buying Price (KES)</label>
            <input type="number" step="0.01" style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} placeholder="300.00" value={form.buying_price} onChange={e => setForm({ ...form, buying_price: e.target.value })} />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 16px', border: '1px solid var(--border)', background: '#fff', borderRadius: '6px', fontSize: '13px' }}>Cancel</button>
            <button type="submit" disabled={loading} className="primary" style={{ padding: '9px 20px', fontSize: '13px' }}>
              {loading ? 'Saving...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
