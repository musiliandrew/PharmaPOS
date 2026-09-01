'use client'

import Link from 'next/link'
import { ArrowRight, Check, Menu, Play, RefreshCw, ShieldCheck, Smartphone, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAsDemoUser } from '@/lib/demoAuth'

const benefits = ['M-Pesa-ready checkout', 'FEFO batch & expiry tracking', 'AI business intelligence reports']

export default function LandingPage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    const success = await loginAsDemoUser()
    if (success) {
      router.push('/dashboard')
    } else {
      setDemoLoading(false)
      alert('Unable to launch demo workspace. Please ensure the backend service is active.')
    }
  }

  return (
    <main className="marketing-shell">
      <nav className="marketing-nav">
        <Link href="/" className="marketing-brand"><span className="brand-mark"><Sparkles size={17} /></span><span>Pharma</span></Link>
        <div className="desktop-links"><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a></div>
        <div className="nav-actions">
          <button onClick={handleDemoLogin} disabled={demoLoading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 6, border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 600, fontSize: 13, background: 'rgba(16, 124, 100, 0.05)', cursor: 'pointer' }}>
            {demoLoading ? <RefreshCw size={14} className="spin" /> : <Play size={14} />} See Demo
          </button>
          <Link href="/login" className="text-link">Log in</Link>
          <Link href="/register" className="nav-cta">Start free <ArrowRight size={15} /></Link>
          <button className="mobile-menu-button" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </nav>
      {menuOpen && (
        <div className="mobile-links">
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <button onClick={handleDemoLogin} disabled={demoLoading} style={{ margin: '8px 0', padding: '10px 16px', borderRadius: 6, border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 600, fontSize: 14, background: 'rgba(16, 124, 100, 0.08)', cursor: 'pointer' }}>
            {demoLoading ? 'Launching demo…' : 'See Live Demo'}
          </button>
        </div>
      )}
      <section className="hero-section"><div className="hero-copy"><span className="eyebrow-pill"><span /> Built for modern Kenyan pharmacies</span><h1>Run your pharmacy with <em>clarity.</em></h1><p>Pharma brings sales, stock, expiry tracking and your whole team into one calm, connected workspace — powered by FEFO and M-Pesa.</p><div className="hero-actions"><button onClick={handleDemoLogin} disabled={demoLoading} className="primary-cta" style={{ background: 'var(--primary)', cursor: 'pointer' }}>{demoLoading ? <><RefreshCw size={17} className="spin" /> Launching Demo...</> : <><Play size={17} /> See Live Demo</>}</button><Link href="/register" className="secondary-cta">Start free trial <ArrowRight size={17} /></Link></div><div className="trust-row"><ShieldCheck size={17} /><span>Instant demo access</span><span className="trust-dot" /><span>Pre-populated inventory data</span></div></div><div className="hero-visual"><div className="visual-card visual-main"><div className="visual-top"><div><small>Today&apos;s sales</small><strong>KES 84,250</strong></div><span className="growth">+12.5%</span></div><div className="mini-chart"><span style={{height:'36%'}} /><span style={{height:'48%'}} /><span style={{height:'41%'}} /><span style={{height:'66%'}} /><span style={{height:'58%'}} /><span style={{height:'81%'}} /><span style={{height:'94%'}} /></div><div className="chart-caption"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div><div className="visual-card visual-stock"><span className="stock-icon"><Smartphone size={17} /></span><div><small>M-Pesa volume</small><strong>KES 61,400</strong></div><span className="live-dot" /></div><div className="visual-card visual-alert"><span className="alert-check"><Check size={15} /></span><div><strong>Stock is healthy</strong><small>All key products in range</small></div></div></div></section>
      <section className="logo-strip"><span>Trusted by growing pharmacies across Kenya</span><div><b>ABC CHEMIST</b><b>MEDPLUS</b><b>care<span>+</span></b><b>PHARMA<span>360</span></b></div></section>
      <section className="feature-section" id="features"><div className="section-intro"><span className="section-kicker">Everything in sync</span><h2>The essentials, without the noise.</h2><p>Spend less time wrestling with software and more time caring for your customers.</p></div><div className="feature-grid">{benefits.map((item, index) => <div className="feature-card" key={item}><span className="feature-number">0{index + 1}</span><h3>{item}</h3><p>{index === 0 ? 'Accept cash, card, and M-Pesa from one fast checkout screen. STK Push to any Kenyan number.' : index === 1 ? 'Automatically deduct from the earliest-expiry batch first. Zero stock losses.' : 'Ask in plain English — your AI copilot returns real answers from live data.'}</p><ArrowRight size={18} /></div>)}</div></section>
      <section className="how-section" id="how-it-works"><div><span className="section-kicker">A better daily rhythm</span><h2>Your pharmacy,<br /><em>flowing forward.</em></h2></div><div className="steps"><div><span>01</span><p><strong>Set up your branch</strong> Add products, invite your team, and start with what you already know.</p></div><div><span>02</span><p><strong>Sell with confidence</strong> Every transaction deducts FEFO stock automatically, including M-Pesa sales.</p></div><div><span>03</span><p><strong>Grow with insight</strong> Ask your AI copilot anything about sales, expiry alerts, and restock needs.</p></div></div></section>
      <section className="cta-section" id="pricing"><div><span className="section-kicker">Start simply</span><h2>Ready to make your<br />day feel lighter?</h2><p>Join pharmacies building a clearer, more connected business with Pharma.</p></div><Link href="/register" className="primary-cta">Create your account <ArrowRight size={17} /></Link></section>
      <footer className="marketing-footer"><span>© 2026 Pharma</span><span>Made for pharmacies in Kenya</span><div><Link href="/login">Log in</Link><Link href="/register">Start free</Link></div></footer>
    </main>
  )
}
