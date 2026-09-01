'use client'

import { useState } from 'react'
import { X, Users, AlertCircle } from 'lucide-react'
import api from '@/lib/api'

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddCustomerModal({ isOpen, onClose, onSuccess }: AddCustomerModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/customers', form)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register customer.')
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
        width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="icon-box"><Users size={18} /></span>
            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 700 }}>Register Customer</h2>
          </div>
          <button onClick={onClose} style={{ border: 0, background: 'none', color: 'var(--muted-foreground)' }}><X size={18} /></button>
        </div>

        {error && (
          <div style={{ background: '#fae8e7', border: '1px solid #f0c4c2', color: '#b94b48', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Full Name *</label>
            <input required style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} placeholder="e.g. Mary Wanjiku" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Phone Number</label>
            <input style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} placeholder="0722 000 111" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Email Address</label>
            <input type="email" style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }} placeholder="mary.w@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 16px', border: '1px solid var(--border)', background: '#fff', borderRadius: '6px', fontSize: '13px' }}>Cancel</button>
            <button type="submit" disabled={loading} className="primary" style={{ padding: '9px 20px', fontSize: '13px' }}>
              {loading ? 'Saving...' : 'Register Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
