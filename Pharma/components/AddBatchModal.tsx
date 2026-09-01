'use client'

import { useState } from 'react'
import { X, Boxes, AlertCircle } from 'lucide-react'
import api from '@/lib/api'

interface AddBatchModalProps {
  isOpen: boolean
  products: any[]
  onClose: () => void
  onSuccess: () => void
}

export function AddBatchModal({ isOpen, products, onClose, onSuccess }: AddBatchModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    product_id: '',
    batch_number: '',
    manufacture_date: '',
    expiry_date: '',
    quantity_initial: '',
    unit_cost: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/inventory/batches', {
        product_id: form.product_id,
        batch_number: form.batch_number,
        manufacture_date: form.manufacture_date ? new Date(form.manufacture_date).toISOString() : null,
        expiry_date: new Date(form.expiry_date).toISOString(),
        quantity_initial: parseInt(form.quantity_initial) || 0,
        unit_cost: parseFloat(form.unit_cost) || 0
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add batch.')
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
        width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="icon-box"><Boxes size={18} /></span>
            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 700 }}>Add Inventory Batch (FEFO)</h2>
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
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Select Product *</label>
            <select
              required
              style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', background: '#fff' }}
              value={form.product_id}
              onChange={e => setForm({ ...form, product_id: e.target.value })}
            >
              <option value="">-- Choose Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Batch Number *</label>
            <input required style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} placeholder="e.g. BATCH-2026-A" value={form.batch_number} onChange={e => setForm({ ...form, batch_number: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Quantity Received *</label>
            <input required type="number" min="1" style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} placeholder="100" value={form.quantity_initial} onChange={e => setForm({ ...form, quantity_initial: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Expiry Date *</label>
            <input required type="date" style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Unit Cost (KES) *</label>
            <input required type="number" step="0.01" style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} placeholder="250.00" value={form.unit_cost} onChange={e => setForm({ ...form, unit_cost: e.target.value })} />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 16px', border: '1px solid var(--border)', background: '#fff', borderRadius: '6px', fontSize: '13px' }}>Cancel</button>
            <button type="submit" disabled={loading} className="primary" style={{ padding: '9px 20px', fontSize: '13px' }}>
              {loading ? 'Adding Batch...' : 'Add Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
