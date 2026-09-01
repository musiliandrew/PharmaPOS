'use client'

import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react'
import { FormEvent, useState } from 'react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setMessage('Demo sign-in complete. Welcome back.') }
  return <main className="auth-shell"><div className="auth-aside"><Link href="/" className="marketing-brand"><span className="brand-mark"><Sparkles size={17} /></span><span>Afya<strong>Flow</strong></span></Link><div className="auth-quote"><span className="section-kicker">Welcome back</span><h1>Your pharmacy is ready.</h1><p>Pick up where you left off and keep your day moving smoothly.</p></div><small>© 2024 AfyaFlow</small></div><div className="auth-panel"><div className="auth-form-wrap"><div className="auth-mobile-brand"><Link href="/" className="marketing-brand"><span className="brand-mark"><Sparkles size={17} /></span><span>Afya<strong>Flow</strong></span></Link></div><span className="section-kicker">Welcome back</span><h2>Log in to AfyaFlow</h2><p className="auth-subtitle">Enter your details to access your pharmacy workspace.</p>{message && <div className="form-message">{message} <Link href="/dashboard">Open workspace</Link></div>}<form onSubmit={submit}><label>Work email<input required type="email" placeholder="jane@abcchemist.co.ke" /></label><label>Password<div className="password-field"><input required type={showPassword ? 'text' : 'password'} placeholder="Your password" /><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label><div className="form-options"><label className="checkbox-label"><input type="checkbox" /> Remember me</label><a href="#forgot">Forgot password?</a></div><button className="primary-cta auth-submit" type="submit">Log in <ArrowRight size={16} /></button></form><p className="auth-switch">New to AfyaFlow? <Link href="/signup">Create an account</Link></p></div></div></main>
}
