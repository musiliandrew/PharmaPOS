'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('pharma_access_token', res.data.access_token)
      localStorage.setItem('pharma_user_email', email)
      setSuccess(true)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Incorrect email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-aside">
        <Link href="/" className="inline-block mb-6"><Image src="/pharma-logo.png" alt="Pharma" width={140} height={42} className="h-9 w-auto object-contain" priority /></Link>
        <div className="auth-quote">
          <span className="section-kicker">Welcome back</span>
          <h1>Your pharmacy is ready.</h1>
          <p>Pick up where you left off and keep your day moving smoothly.</p>
        </div>
        <small>© 2026 Pharma</small>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <Link href="/" className="inline-block mb-6"><Image src="/pharma-logo.png" alt="Pharma" width={140} height={42} className="h-9 w-auto object-contain" priority /></Link>
          </div>
          <span className="section-kicker">Welcome back</span>
          <h2>Log in to Pharma</h2>
          <p className="auth-subtitle">Enter your details to access your pharmacy workspace.</p>
          
          <div style={{ background: 'rgba(16, 124, 100, 0.06)', border: '1px solid rgba(16, 124, 100, 0.2)', borderRadius: 8, padding: 14, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: 13, color: 'var(--primary)' }}>Want a quick test drive?</strong>
                <small style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Log in instantly as <b>jane@abcchemist.co.ke</b></small>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setLoading(true)
                  setEmail('jane@abcchemist.co.ke')
                  setPassword('Password123!')
                  try {
                    const res = await api.post('/auth/login', { email: 'jane@abcchemist.co.ke', password: 'Password123!' })
                    localStorage.setItem('pharma_access_token', res.data.access_token)
                    localStorage.setItem('pharma_user_email', 'jane@abcchemist.co.ke')
                    setSuccess(true)
                    router.push('/dashboard')
                  } catch (err: any) {
                    setError('Demo login failed.')
                  } finally {
                    setLoading(false)
                  }
                }}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Log in as Demo User
              </button>
            </div>
          </div>

          {error && <div className="form-message" style={{ background: '#fae8e7', borderColor: '#f0c4c2', color: '#b94b48' }}>{error}</div>}
          {success && <div className="form-message">Sign-in complete. <Link href="/dashboard">Open workspace</Link></div>}
          <form onSubmit={submit}>
            <label>Work email
              <input required type="email" placeholder="jane@abcchemist.co.ke" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label>Password
              <div className="password-field">
                <input required type={showPassword ? 'text' : 'password'} placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button>
              </div>
            </label>
            <div className="form-options">
              <label className="checkbox-label"><input type="checkbox" /> Remember me</label>
              <a href="#forgot">Forgot password?</a>
            </div>
            <button className="primary-cta auth-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : <><span>Log in</span> <ArrowRight size={16} /></>}
            </button>
          </form>
          <p className="auth-switch">New to Pharma? <Link href="/register">Create an account</Link></p>
        </div>
      </div>
    </main>
  )
}
