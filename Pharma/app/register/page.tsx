'use client'

import Link from 'next/link'
import { ArrowRight, Check, Eye, EyeOff, Sparkles } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    owner_name: '',
    pharmacy_name: '',
    email: '',
    password: '',
    branch_name: 'Main Branch'
  })

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/register', {
        pharmacy_name: form.pharmacy_name,
        owner_name: form.owner_name,
        email: form.email,
        password: form.password,
        branch_name: form.branch_name
      })
      localStorage.setItem('pharma_access_token', res.data.access_token)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-aside">
        <Link href="/" className="marketing-brand"><span className="brand-mark"><Sparkles size={17} /></span><span>Pharma</span></Link>
        <div className="auth-quote">
          <span className="section-kicker">A clearer way to work</span>
          <h1>More time for what matters.</h1>
          <p>Pharma helps your team run every part of the pharmacy day with confidence.</p>
          <div className="quote-list">
            <span><Check size={15} /> Sales and FEFO stock in sync</span>
            <span><Check size={15} /> M-Pesa ready from day one</span>
            <span><Check size={15} /> AI copilot for business insights</span>
          </div>
        </div>
        <small>© 2026 Pharma</small>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <Link href="/" className="marketing-brand"><span className="brand-mark"><Sparkles size={17} /></span><span>Pharma</span></Link>
          </div>
          <span className="section-kicker">Start your free trial</span>
          <h2>Create your account</h2>
          <p className="auth-subtitle">Get your pharmacy moving in minutes. No credit card required.</p>

          <div style={{ background: 'rgba(16, 124, 100, 0.06)', border: '1px solid rgba(16, 124, 100, 0.2)', borderRadius: 8, padding: 14, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: 13, color: 'var(--primary)' }}>Want to explore pre-filled data?</strong>
                <small style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Bypass registration and open <b>ABC Chemist</b> demo</small>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true)
                  try {
                    const res = await api.post('/auth/login', { email: 'jane@abcchemist.co.ke', password: 'Password123!' })
                    localStorage.setItem('pharma_access_token', res.data.access_token)
                    localStorage.setItem('pharma_user_email', 'jane@abcchemist.co.ke')
                    router.push('/dashboard')
                  } catch (err: any) {
                    setError('Demo login failed.')
                  } finally {
                    setLoading(false)
                  }
                }}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Launch Live Demo
              </button>
            </div>
          </div>

          {error && <div className="form-message" style={{ background: '#fae8e7', borderColor: '#f0c4c2', color: '#b94b48' }}>{error}</div>}
          {submitted ? (
            <div className="auth-success">
              <span><Check size={18} /></span>
              <h3>You&apos;re on your way.</h3>
              <p>Your pharmacy account is ready. Open your workspace to start adding products and selling.</p>
              <Link href="/dashboard" className="primary-cta">Open Pharma <ArrowRight size={16} /></Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label>Your full name
                <input required placeholder="Jane Mwangi" value={form.owner_name} onChange={e => setForm({ ...form, owner_name: e.target.value })} />
              </label>
              <label>Pharmacy business name
                <input required placeholder="ABC Chemist" value={form.pharmacy_name} onChange={e => setForm({ ...form, pharmacy_name: e.target.value })} />
              </label>
              <label>Work email
                <input required type="email" placeholder="jane@abcchemist.co.ke" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </label>
              <label>Password
                <div className="password-field">
                  <input required minLength={8} type={showPassword ? 'text' : 'password'} placeholder="8+ characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button>
                </div>
              </label>
              <button className="primary-cta auth-submit" type="submit" disabled={loading}>
                {loading ? 'Creating account…' : <><span>Create account</span> <ArrowRight size={16} /></>}
              </button>
              <p className="legal-copy">By creating an account, you agree to our Terms and Privacy Policy.</p>
            </form>
          )}
          <p className="auth-switch">Already have an account? <Link href="/login">Log in</Link></p>
        </div>
      </div>
    </main>
  )
}
