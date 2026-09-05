'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  ArrowRight,
  Play,
  Check,
  ChevronDown,
  Clock3,
  Package,
  BrainCircuit,
  BarChart3,
  Smartphone,
  ShieldCheck,
  Users,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Pill,
  Settings,
  LayoutDashboard,
  Receipt,
  Boxes,
  Truck,
  UserRound,
  Wallet,
  Menu,
  X,
  RefreshCw,
  Printer,
  QrCode,
  FileText,
  CheckCircle2,
  Zap,
  Shield,
  Building2,
  Store,
  Sparkles,
  MessageSquare,
  Database,
} from 'lucide-react'
import { loginAsDemoUser } from '@/lib/demoAuth'

export default function Home() {
  const router = useRouter()
  const [demoLoading, setDemoLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
    <main className="min-h-screen bg-white text-[#173532] selection:bg-[#d8eee8] selection:text-[#087e6d]">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} onDemoLogin={handleDemoLogin} demoLoading={demoLoading} />
      <Hero onDemoLogin={handleDemoLogin} demoLoading={demoLoading} />
      <TrustBar />
      <Features />
      <Workflow />
      <Integrations />
      <Pricing onDemoLogin={handleDemoLogin} demoLoading={demoLoading} />
      <Testimonial />
      <CTA onDemoLogin={handleDemoLogin} demoLoading={demoLoading} />
      <Footer />
    </main>
  )
}

/* -------------------------------------------------------------------------- */
/* NAVBAR                                                                     */
/* -------------------------------------------------------------------------- */

function Navbar({
  menuOpen,
  setMenuOpen,
  onDemoLogin,
  demoLoading
}: {
  menuOpen: boolean
  setMenuOpen: (v: boolean) => void
  onDemoLogin: () => void
  demoLoading: boolean
}) {
  return (
    <header className="sticky top-0 z-50 !block !h-auto !p-0 border-b border-[#e8efed] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center group shrink-0 py-1">
          <Image
            src="/pharma-logo.png"
            alt="Pharma"
            width={140}
            height={42}
            className="h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
            priority
          />
        </Link>

        <div role="navigation" className="hidden md:flex items-center gap-7 lg:gap-9 text-[13px] font-medium">
          <a href="#features" className="text-[#5b736f] hover:text-[#118c78] transition-colors py-1">Features</a>
          <a href="#how-it-works" className="text-[#5b736f] hover:text-[#118c78] transition-colors py-1">How it works</a>
          <a href="#pricing" className="text-[#5b736f] hover:text-[#118c78] transition-colors py-1">Pricing</a>
          <a href="#integrations" className="text-[#5b736f] hover:text-[#118c78] transition-colors py-1">Integrations</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <button
            onClick={onDemoLogin}
            disabled={demoLoading}
            className="hidden items-center gap-1.5 rounded-lg border border-[#138d78] bg-[#138d78]/5 px-3.5 py-2 text-[12px] font-semibold text-[#138d78] transition hover:bg-[#138d78]/10 sm:inline-flex"
          >
            {demoLoading ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} className="fill-current" />}
            <span>Live Demo</span>
          </button>

          <Link href="/login" className="hidden text-[13px] font-medium text-[#516864] transition hover:text-[#138d78] md:block px-1">
            Log in
          </Link>

          <Link href="/register" className="rounded-lg bg-[#087e6d] px-3.5 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#066d5f] inline-flex items-center gap-1.5 shrink-0">
            <span>Start free trial</span>
            <ArrowRight size={13} className="hidden sm:inline" />
          </Link>

          <button
            type="button"
            className="text-[#173532] md:hidden p-2 rounded-lg hover:bg-[#edf5f2] transition"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-[#e8efed] bg-white px-5 py-4 md:hidden shadow-xl transition-all">
          <div className="flex flex-col space-y-1 pb-3">
            <a href="#features" onClick={() => setMenuOpen(false)} className="rounded-lg px-3.5 py-2 text-[14px] font-medium text-[#465c58] hover:bg-[#eef8f5] hover:text-[#118c78] transition-colors">Features</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="rounded-lg px-3.5 py-2 text-[14px] font-medium text-[#465c58] hover:bg-[#eef8f5] hover:text-[#118c78] transition-colors">How it works</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="rounded-lg px-3.5 py-2 text-[14px] font-medium text-[#465c58] hover:bg-[#eef8f5] hover:text-[#118c78] transition-colors">Pricing</a>
            <a href="#integrations" onClick={() => setMenuOpen(false)} className="rounded-lg px-3.5 py-2 text-[14px] font-medium text-[#465c58] hover:bg-[#eef8f5] hover:text-[#118c78] transition-colors">Integrations</a>
          </div>

          <div className="border-t border-[#edf3f1] pt-3.5 space-y-2.5">
            <button
              onClick={() => { setMenuOpen(false); onDemoLogin(); }}
              disabled={demoLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#138d78] bg-[#138d78]/5 py-2.5 text-[13px] font-semibold text-[#138d78] transition hover:bg-[#138d78]/10"
            >
              {demoLoading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} className="fill-current" />}
              <span>Explore Live Demo</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center rounded-lg border border-[#d2dfdb] py-2 text-[13px] font-medium text-[#3b524e] hover:bg-[#f6faf8] transition text-center"
              >
                Log in
              </Link>

              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[#087e6d] py-2 text-[13px] font-semibold text-white hover:bg-[#066d5f] transition text-center shadow-sm"
              >
                <span>Register</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/* LOGO                                                                       */
/* -------------------------------------------------------------------------- */

function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <Image
      src="/pharma-favicon.png"
      alt="Pharma"
      width={36}
      height={36}
      className={`${className} object-contain`}
      priority
    />
  )
}

/* -------------------------------------------------------------------------- */
/* HERO                                                                       */
/* -------------------------------------------------------------------------- */

function Hero({ onDemoLogin, demoLoading }: { onDemoLogin: () => void; demoLoading: boolean }) {
  return (
    <section className="overflow-hidden bg-white">
      <div className="mx-auto grid max-w-[1180px] items-center gap-10 lg:gap-14 px-4 sm:px-6 pb-16 sm:pb-20 pt-10 sm:pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:pt-24">
        {/* LEFT */}
        <div>
          <div className="mb-6 sm:mb-7 inline-flex items-center gap-2 rounded-full border border-[#d8eee8] bg-[#eef9f5] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#138b76]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1aae89]" />
            Built for modern Kenyan pharmacies 🇰🇪
          </div>

          <h1 className="max-w-[550px] text-[40px] sm:text-[50px] md:text-[62px] font-medium leading-[1] sm:leading-[0.98] tracking-[-0.05em] text-[#173532]">
            Run your pharmacy<br />with <span className="font-serif italic text-[#118c78]">clarity.</span>
          </h1>

          <p className="mt-5 sm:mt-7 max-w-[500px] text-[15px] sm:text-[16px] leading-7 text-[#748682]">
            Pharma brings sales, stock, expiry tracking and your whole team into one calm, connected workspace — powered by FEFO and M-Pesa.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onDemoLogin}
              disabled={demoLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#087e6d] px-6 py-3.5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(8,126,109,0.18)] transition hover:-translate-y-0.5 hover:bg-[#066d5f]"
            >
              {demoLoading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={13} className="fill-current" />}
              See Live Demo
            </button>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg border border-[#cddbd7] bg-white px-6 py-3.5 text-[13px] font-medium text-[#35514d] transition hover:border-[#138d78] hover:text-[#138d78]"
            >
              Start free trial
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-[11px] text-[#71827f]">
            <div className="flex items-center gap-2">
              <Smartphone size={15} className="text-[#15927d]" />
              M-Pesa ready
            </div>
            <div className="flex items-center gap-2">
              <Package size={15} className="text-[#15927d]" />
              FEFO inventory
            </div>
            <div className="flex items-center gap-2">
              <BrainCircuit size={15} className="text-[#15927d]" />
              AI insights
            </div>
          </div>
        </div>

        {/* DASHBOARD PREVIEW */}
        <DashboardPreview />
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* DASHBOARD PREVIEW                                                          */
/* -------------------------------------------------------------------------- */

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-10 rounded-full bg-[#dff4ed] opacity-60 blur-3xl pointer-events-none" />

      <div className="relative overflow-hidden rounded-[18px] border-[4px] border-[#e3efeb] bg-white shadow-[0_30px_80px_rgba(20,76,67,0.12)]">
        {/* Dashboard header */}
        <div className="flex h-12 items-center justify-between border-b border-[#edf2f0] px-4 bg-[#fbfdfc]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/80" />
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-[#e4edea]">
              <LogoMark className="h-5 w-5" />
              <span className="text-[12px] font-semibold text-[#173532]">Pharma</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-[#778783]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5f0] px-2.5 py-0.5 font-medium text-[#138d78]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#159d83] animate-pulse" />
              Live Workspace
            </span>
            <div className="h-6 w-6 rounded-full bg-[#e8f4ef] border border-[#d2ebe3] flex items-center justify-center font-bold text-[#148c77] text-[9px]">JD</div>
          </div>
        </div>

        <div className="grid min-h-[420px] grid-cols-1 sm:grid-cols-[110px_1fr]">
          {/* Sidebar */}
          <aside className="hidden sm:block border-r border-[#edf2f0] bg-[#fbfdfc] p-2.5 space-y-1">
            <SidebarItem icon={LayoutDashboard} text="Dashboard" active />
            <SidebarItem icon={Receipt} text="Sales" />
            <SidebarItem icon={Pill} text="Products" />
            <SidebarItem icon={Boxes} text="Stock" />
            <SidebarItem icon={Truck} text="Purchases" />
            <SidebarItem icon={Users} text="Customers" />
            <SidebarItem icon={BarChart3} text="Reports" />
            <SidebarItem icon={Wallet} text="Expenses" />
            <SidebarItem icon={UserRound} text="Users" />
            <SidebarItem icon={Settings} text="Settings" />
          </aside>

          {/* Content */}
          <div className="bg-white p-3.5 sm:p-4">
            <div className="mb-3.5 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#173532]">Dashboard</h3>
              <span className="rounded-md border border-[#e5ece9] px-2.5 py-1 text-[9px] font-medium text-[#6f817d]">
                Today
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Metric title="Today's Sales" value="KES 84,250" change="12.5%" />
              <Metric title="Transactions" value="156" change="8.2%" />
              <Metric title="Gross Profit" value="KES 28,410" change="10.1%" />
              <Metric title="Low Stock" value="23" change="View items" isWarning />
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-[1.55fr_0.95fr] gap-2.5">
              <SalesChart />
              <Categories />
            </div>

            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <SmallMetric icon={AlertTriangle} title="Expiring Soon" value="14 items" isWarning />
              <SmallMetric icon={ShoppingCart} title="Low Stock" value="9 items" />
              <SmallMetric icon={Smartphone} title="M-Pesa Receipts" value="KES 24,350" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SidebarItem({ icon: Icon, text, active = false }: { icon: any; text: string; active?: boolean }) {
  return (
    <div
      className={
        active
          ? 'flex items-center gap-2 rounded-md px-2 py-1.5 text-[9px] bg-[#e6f4ef] font-semibold text-[#138875]'
          : 'flex items-center gap-2 rounded-md px-2 py-1.5 text-[9px] text-[#7b8986] hover:bg-[#f3f7f5]'
      }
    >
      <Icon size={12} />
      {text}
    </div>
  )
}

function Metric({ title, value, change, isWarning }: { title: string; value: string; change: string; isWarning?: boolean }) {
  return (
    <div className="rounded-lg border border-[#e9efed] p-2.5 bg-[#fbfdfc]">
      <div className="text-[8px] text-[#899793]">{title}</div>
      <div className={isWarning ? 'mt-1 text-[13px] font-bold text-[#b94b48]' : 'mt-1 text-[13px] font-bold text-[#173532]'}>{value}</div>
      <div className={isWarning ? 'mt-0.5 text-[8px] font-medium text-[#b94b48]' : 'mt-0.5 text-[8px] font-medium text-[#1a9a7e]'}>↗ {change}</div>
    </div>
  )
}

function SalesChart() {
  return (
    <div className="rounded-lg border border-[#e9efed] p-2.5 bg-white">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-[#173532]">Sales Overview</span>
        <span className="text-[8px] text-[#899793]">Today</span>
      </div>

      <div className="relative h-[115px] overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[1, 2, 3, 4].map((x) => (
            <div key={x} className="border-t border-dashed border-[#edf1ef]" />
          ))}
        </div>

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 150" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#45c8a6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#45c8a6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 135 C35 130 45 125 70 126 C100 123 110 108 135 112 C165 115 165 91 190 94 C215 95 220 79 245 80 C270 80 275 66 300 69 C330 72 330 51 360 53 C390 55 400 35 420 38 C445 41 455 16 500 10 L500 150 L0 150 Z"
            fill="url(#chartFill)"
          />
          <path
            d="M0 135 C35 130 45 125 70 126 C100 123 110 108 135 112 C165 115 165 91 190 94 C215 95 220 79 245 80 C270 80 275 66 300 69 C330 72 330 51 360 53 C390 55 400 35 420 38 C445 41 455 16 500 10"
            fill="none"
            stroke="#15927b"
            strokeWidth="2.5"
          />
        </svg>
      </div>

      <div className="mt-1 flex justify-between text-[7px] text-[#9aa7a4]">
        <span>08:00</span>
        <span>11:00</span>
        <span>14:00</span>
        <span>17:00</span>
        <span>20:00</span>
      </div>
    </div>
  )
}

function Categories() {
  return (
    <div className="rounded-lg border border-[#e9efed] p-2.5 bg-white flex flex-col justify-between">
      <div className="text-[10px] font-semibold text-[#173532]">Top Categories</div>

      <div className="my-1 flex items-center justify-center">
        <div className="relative flex h-18 w-18 items-center justify-center rounded-full border-[10px] border-[#65cbb0]">
          <div className="absolute inset-[-10px] rounded-full border-[10px] border-transparent border-r-[#d6efe8] border-t-[#9cdbca] -rotate-45" />
          <span className="text-[11px] font-bold text-[#173532]">62%</span>
        </div>
      </div>

      <div className="space-y-1 text-[8px] text-[#758580]">
        <div className="flex justify-between"><span>● Medicines</span><b>62%</b></div>
        <div className="flex justify-between"><span>● Personal Care</span><b>18%</b></div>
        <div className="flex justify-between"><span>● Baby Care</span><b>10%</b></div>
      </div>
    </div>
  )
}

function SmallMetric({ icon: Icon, title, value, isWarning }: { icon: any; title: string; value: string; isWarning?: boolean }) {
  return (
    <div className="rounded-lg border border-[#e9efed] p-2 bg-[#fbfdfc]">
      <Icon size={14} className={isWarning ? 'text-[#b88421]' : 'text-[#15927d]'} />
      <div className="mt-1 text-[8px] text-[#7b8985]">{title}</div>
      <div className="mt-0.5 text-[11px] font-bold text-[#173532]">{value}</div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* TRUST BAR                                                                  */
/* -------------------------------------------------------------------------- */

function TrustBar() {
  return (
    <section className="border-y border-[#edf2f0] bg-[#fcfdfd]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-10 px-6 py-7 text-center">
        <span className="text-[10px] uppercase font-semibold tracking-wider text-[#9aa7a4]">
          Trusted by growing pharmacies across Kenya
        </span>
        <span className="text-[12px] font-bold tracking-wide text-[#758783]">ABC CHEMIST</span>
        <span className="text-[12px] font-bold text-[#71817d]">MEDPLUS</span>
        <span className="text-[14px] font-semibold text-[#87948f]">care<span className="text-[#13917b]">+</span></span>
        <span className="text-[12px] font-bold text-[#5f7d76]">PHARMA<span className="text-[#13917b]">360</span></span>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* FEATURES                                                                   */
/* -------------------------------------------------------------------------- */

const features = [
  {
    number: '01',
    icon: Smartphone,
    title: 'M-Pesa STK Push Checkout',
    description: 'Accept cash, card, and M-Pesa in one fast screen. Instant automated STK push directly to customer phones with auto-reconciliation to your Till or Paybill.',
  },
  {
    number: '02',
    icon: Package,
    title: 'FEFO Batch & Expiry Radar',
    description: 'Strict First-Expired First-Out dispensing prevents dead stock. Proactive 90/60/30-day early warning radar flags near-expiry medicines before losses occur.',
  },
  {
    number: '03',
    icon: BrainCircuit,
    title: 'AI Pharmacist Copilot',
    description: 'Ask clinical and sales questions in plain English. Get instant margin comparisons, restock recommendations, and sales forecasts based on customer traffic.',
  },
  {
    number: '04',
    icon: QrCode,
    title: 'Barcode Scanning & Quick Search',
    description: 'Plug-and-play barcode scanner support. Smart fuzzy search by generic active molecule, brand name, dosage formulation, and strength.',
  },
  {
    number: '05',
    icon: ShieldCheck,
    title: 'PPB & Dangerous Drugs Register',
    description: 'Digital Poison & Prescription book conforming to Kenya Pharmacy and Poisons Board standards with full audit logs for controlled POM medicines.',
  },
  {
    number: '06',
    icon: BarChart3,
    title: 'Live Margin & Profit Ledgers',
    description: 'Real-time gross profit calculation per item, cashier shift cash-drop reconciliations, supplier debt tracking, and 1-click Excel/PDF exports.',
  },
]

function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-24 bg-white">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-14 max-w-[620px]">
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#14927d]">
            Core Pharmacy Modules
          </div>
          <h2 className="text-[38px] font-medium leading-[1.05] tracking-[-0.045em] text-[#173532]">
            Engineered specifically for Kenyan chemists.
          </h2>
          <p className="mt-4 text-[15px] leading-6 text-[#798985]">
            From fast OTC checkout queues to automated expiry prevention and regulatory books, Pharma handles the complete lifecycle of your pharmacy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.number}
                className="group min-h-[245px] rounded-xl border border-[#e1eae7] bg-[#fbfdfc] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#b9ddd3] hover:bg-white hover:shadow-[0_18px_40px_rgba(20,80,70,0.07)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#eaf7f2] text-[#13927b] group-hover:scale-105 transition-transform">
                      <Icon size={22} />
                    </div>
                    <span className="text-[11px] font-bold text-[#15927d] font-mono">{feature.number}</span>
                  </div>
                  <h3 className="mt-6 text-[17px] font-semibold tracking-[-0.02em] text-[#173532]">{feature.title}</h3>
                  <p className="mt-2.5 text-[13px] leading-5 text-[#738580]">{feature.description}</p>
                </div>
                <div className="mt-6 text-[#13927b] transition group-hover:translate-x-1 flex items-center gap-1 text-[12px] font-medium">
                  <span>Learn more</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* WORKFLOW                                                                   */
/* -------------------------------------------------------------------------- */

function Workflow() {
  const steps = [
    {
      number: '01',
      title: 'Set up your branch & catalog',
      description: 'Add products, upload batch numbers with expiry dates, configure your Till or Paybill, and invite staff with permissions.',
    },
    {
      number: '02',
      title: 'Sell with confidence & instant STK push',
      description: 'Cashiers scan barcodes and trigger instant M-Pesa STK prompts. System confirms receipt and prints thermal slips automatically.',
    },
    {
      number: '03',
      title: 'Deduct stock automatically with FEFO',
      description: 'First-Expired First-Out dispensing automatically sells the nearest expiring batch, preventing dead stock and expired medicine waste.',
    },
    {
      number: '04',
      title: 'Scale multi-location operations',
      description: 'Centralize wholesale supplier orders, transfer inventory between branches, and monitor consolidated profit margins in real time.',
    },
  ]

  return (
    <section id="how-it-works" className="scroll-mt-20 overflow-hidden bg-[#edf8f4] py-24">
      <div className="mx-auto grid max-w-[1180px] gap-16 px-6 lg:grid-cols-2 items-center">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#15927d]">
            A better daily rhythm
          </div>

          <h2 className="mt-4 text-[42px] font-medium leading-[1] tracking-[-0.05em] text-[#173532]">
            Your pharmacy,<br />
            <span className="font-serif italic text-[#118c78]">flowing forward.</span>
          </h2>

          <p className="mt-5 max-w-[390px] text-[14px] leading-6 text-[#70847e]">
            Pharma helps you run a smarter, more profitable business — every single day.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-7">
            <Benefit icon={Clock3} title="Save time" text="Automate routine stock counting and manual reconciliations." />
            <Benefit icon={Package} title="Reduce losses" text="Strict FEFO and proactive 60-day expiry radar keep stock fresh." />
            <Benefit icon={Users} title="Delight customers" text="Sub-second barcode scan, fast checkout, and SMS receipts." />
            <Benefit icon={TrendingUp} title="Grow with confidence" text="Clear margin insights to make profitable purchasing decisions." />
          </div>
        </div>

        <div className="relative">
          <div className="space-y-0">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex gap-5 border-b border-[#d4e8e2] py-5">
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#53bca4] bg-[#edf8f4] text-[11px] font-semibold text-[#148c77]">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute left-[15px] top-[48px] h-[calc(100%-16px)] border-l border-dashed border-[#83cdbd]" />
                )}
                <div>
                  <h3 className="text-[15px] font-semibold text-[#173532]">{step.title}</h3>
                  <p className="mt-1 max-w-[420px] text-[12px] leading-5 text-[#7b8b86]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-[#d7e8e3] bg-white shadow-[0_20px_50px_rgba(24,91,78,0.08)]">
            <div className="flex h-[150px] items-center justify-center bg-gradient-to-br from-[#f8fffc] to-[#dcefe9]">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md text-[#15927d]">
                  <Pill size={24} />
                </div>
                <div className="mt-3 text-[13px] font-semibold text-[#173532]">Your pharmacy. Connected.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Benefit({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div>
      <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-[#cde6de] bg-white text-[#14917b]">
        <Icon size={16} />
      </div>
      <div className="text-[12px] font-semibold text-[#173532]">{title}</div>
      <p className="mt-1.5 text-[11px] leading-4 text-[#7b8c87]">{text}</p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* INTEGRATIONS                                                               */
/* -------------------------------------------------------------------------- */

const integrations = [
  {
    icon: Smartphone,
    name: 'Pay Hero & Safaricom M-Pesa',
    category: 'Payment Gateway',
    tag: 'Native STK Push',
    description: 'Instant STK PIN push to customer phones. Automatic payment callback verification directly into your Till or Paybill number with zero manual reconciliation.',
  },
  {
    icon: Printer,
    name: 'ESC/POS Thermal Receipt Printers',
    category: 'Hardware',
    tag: 'Plug & Play',
    description: 'Universal compatibility with standard 58mm and 80mm USB, LAN, and Bluetooth thermal printers (Epson, Xprinter, Rongta, Star) for fast receipt printing.',
  },
  {
    icon: QrCode,
    name: '1D / 2D Barcode Scanners',
    category: 'Hardware',
    tag: 'Universal HID',
    description: 'Instant barcode recognition with any standard handheld USB or wireless barcode scanner. Eliminate dispensing errors and speed up OTC queues.',
  },
  {
    icon: ShieldCheck,
    name: 'Kenya PPB Regulatory Compliance',
    category: 'Regulatory',
    tag: 'Official Standard',
    description: 'Built to conform with Kenya Pharmacy and Poisons Board standards. Maintain digital Dangerous Drugs Registers (DDA) and prescription POM records.',
  },
  {
    icon: MessageSquare,
    name: 'SMS Gateways (Africa\'s Talking / Advanta)',
    category: 'Customer Comms',
    tag: 'Automated SMS',
    description: 'Deliver automated digital SMS receipts upon checkout and schedule automated chronic medication refill reminders for patient retention.',
  },
  {
    icon: Database,
    name: 'Excel, QuickBooks & PDF Exports',
    category: 'Accounting',
    tag: '1-Click Export',
    description: 'Export sales ledgers, stock valuation, and supplier accounts payable directly into structured Microsoft Excel spreadsheets, CSVs, or audit-ready PDFs.',
  },
]

function Integrations() {
  return (
    <section id="integrations" className="scroll-mt-20 py-24 bg-white border-t border-[#edf2f0]">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mb-14 max-w-[620px]">
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#14927d]">
            Ecosystem &amp; Hardware
          </div>
          <h2 className="text-[38px] font-medium leading-[1.05] tracking-[-0.045em] text-[#173532]">
            Connected with the tools your chemist relies on daily.
          </h2>
          <p className="mt-4 text-[15px] leading-6 text-[#798985]">
            No proprietary hardware lock-in. Pharma connects natively to standard Kenyan payment infrastructure, POS printers, scanners, and regulatory registers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.name}
                className="group rounded-2xl border border-[#e2eae7] bg-[#fbfdfc] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#b8ded4] hover:bg-white hover:shadow-[0_20px_40px_rgba(20,80,70,0.06)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf7f2] text-[#13927b] group-hover:scale-105 transition-transform">
                      <Icon size={22} />
                    </div>
                    <span className="rounded-full bg-[#edf7f3] border border-[#d2ebe2] px-2.5 py-1 text-[10px] font-bold text-[#148c77]">
                      {item.tag}
                    </span>
                  </div>

                  <div className="mt-5 text-[11px] font-medium text-[#7d908c] uppercase tracking-wider">
                    {item.category}
                  </div>
                  <h3 className="mt-1.5 text-[16px] font-semibold tracking-[-0.02em] text-[#173532]">
                    {item.name}
                  </h3>
                  <p className="mt-2.5 text-[12px] leading-5 text-[#738580]">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#eff4f2] flex items-center justify-between text-[11px] font-medium text-[#13927b]">
                  <span>Active integration</span>
                  <CheckCircle2 size={15} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* PRICING                                                                    */
/* -------------------------------------------------------------------------- */

function Pricing({ onDemoLogin, demoLoading }: { onDemoLogin: () => void; demoLoading: boolean }) {
  const [annual, setAnnual] = useState(false)

  const plans = [
    {
      name: 'Solo Chemist',
      tagline: 'Ideal for independent retail chemists and single-dispensary clinics.',
      monthlyPrice: 2500,
      annualPrice: 2000,
      popular: false,
      features: [
        '1 Chemist branch / outlet',
        'Up to 2 cashier user seats',
        'Sub-second barcode POS checkout',
        'M-Pesa STK Push (Pay Hero Till / Paybill)',
        'Automatic FEFO batch expiry deductions',
        'Daily sales & cash-drop shift reports',
        'Email & WhatsApp onboarding support',
      ],
      ctaText: 'Start 14-day free trial',
      ctaHref: '/register',
    },
    {
      name: 'Growing Pharmacy',
      tagline: 'Built for high-volume retail pharmacies needing predictive intelligence.',
      monthlyPrice: 5500,
      annualPrice: 4400,
      popular: true,
      badge: 'Recommended',
      features: [
        'Up to 2 branches included',
        'Unlimited cashier & pharmacist accounts',
        'Automated M-Pesa STK Push & auto-reconciliation',
        'AI Copilot business intelligence queries',
        '90/60/30-day early expiry warning radar',
        'Controlled drugs / DDA prescription register',
        'Cashier shift reconciliation & audits',
        'Supplier debts, purchase orders & profit ledgers',
        'Priority telephone & WhatsApp VIP support',
      ],
      ctaText: 'Start free trial',
      ctaHref: '/register',
    },
    {
      name: 'Pharmacy Chain & Enterprise',
      tagline: 'For multi-location retail chains and hospital pharmacy operations.',
      monthlyPrice: 12000,
      annualPrice: 9600,
      popular: false,
      features: [
        'Up to 5 branches included (+KES 1,800/extra branch)',
        'Central warehouse & inter-branch stock transfers',
        'Multi-till M-Pesa channel mapping per branch',
        'Consolidated multi-branch P&L & velocity metrics',
        'KRA eTIMS automated tax compliance integration',
        'Legacy POS catalog & batch data migration',
        'Dedicated account manager & staff training',
        '99.9% uptime SLA guarantee',
      ],
      ctaText: 'Talk to sales',
      ctaHref: '/register',
    },
  ]

  return (
    <section id="pricing" className="scroll-mt-20 py-24 bg-[#f8faf9] border-t border-[#edf2f0]">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="text-center max-w-[640px] mx-auto">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#d2ebe2] bg-[#eef9f5] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#14927d]">
            Transparent Pricing
          </div>
          <h2 className="text-[38px] font-medium leading-[1.05] tracking-[-0.045em] text-[#173532] md:text-[46px]">
            Simple, honest plans for <span className="font-serif italic text-[#118c78]">every chemist.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-6 text-[#778883]">
            No unexpected onboarding fees. Full 14-day free trial on all plans. All plans include automated FEFO inventory and M-Pesa STK push.
          </p>

          {/* Billing Switch */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#dce7e3] bg-white p-1.5 shadow-sm">
            <button
              onClick={() => setAnnual(false)}
              className={
                !annual
                  ? 'rounded-full bg-[#087e6d] px-5 py-2 text-[12px] font-semibold text-white transition'
                  : 'rounded-full px-5 py-2 text-[12px] font-medium text-[#657975] hover:text-[#173532] transition'
              }
            >
              Monthly billing
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={
                annual
                  ? 'inline-flex items-center gap-1.5 rounded-full bg-[#087e6d] px-5 py-2 text-[12px] font-semibold text-white transition'
                  : 'inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-[12px] font-medium text-[#657975] hover:text-[#173532] transition'
              }
            >
              <span>Annual billing</span>
              <span className="rounded-full bg-[#d8eee8] px-2 py-0.5 text-[10px] font-bold text-[#087e6d]">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid gap-7 lg:grid-cols-3">
          {plans.map((plan) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice
            return (
              <div
                key={plan.name}
                className={
                  plan.popular
                    ? 'relative rounded-2xl border-2 border-[#138d78] bg-white p-8 shadow-[0_25px_60px_rgba(19,141,120,0.12)] flex flex-col justify-between'
                    : 'relative rounded-2xl border border-[#dfe8e5] bg-white p-8 shadow-sm flex flex-col justify-between'
                }
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#087e6d] px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="text-[19px] font-semibold tracking-[-0.02em] text-[#173532]">{plan.name}</div>
                  <p className="mt-2 text-[12px] leading-5 text-[#738580] min-h-[40px]">{plan.tagline}</p>

                  <div className="mt-6 flex items-baseline gap-1.5 border-b border-[#edf3f1] pb-6">
                    <span className="text-[13px] font-bold text-[#627773]">KES</span>
                    <span className="text-[38px] font-bold tracking-[-0.03em] text-[#173532]">
                      {price.toLocaleString()}
                    </span>
                    <span className="text-[12px] text-[#7c8f8a]">/ month</span>
                  </div>

                  <div className="mt-6 space-y-3 text-[12px]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#697d79]">What is included:</div>
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-[#475d59]">
                        <CheckCircle2 size={16} className="text-[#138d78] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#edf3f1] space-y-2.5">
                  <Link
                    href={plan.ctaHref}
                    className={
                      plan.popular
                        ? 'w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#087e6d] py-3.5 text-[13px] font-semibold text-white shadow-md transition hover:bg-[#066d5f]'
                        : 'w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#cbd9d5] bg-white py-3.5 text-[13px] font-semibold text-[#173532] transition hover:border-[#138d78] hover:text-[#138d78]'
                    }
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight size={14} />
                  </Link>

                  <button
                    onClick={onDemoLogin}
                    disabled={demoLoading}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-[#607470] hover:text-[#138d78] transition"
                  >
                    {demoLoading ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} className="fill-current" />}
                    <span>or test live demo workspace</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Assurance Pills */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] font-medium text-[#728581] border-t border-[#e6eeea] pt-8">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-[#138d78]" />
            <span>14-day full access free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-[#138d78]" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-[#138d78]" />
            <span>M-Pesa payments accepted</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-[#138d78]" />
            <span>Cancel anytime with 1 click</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* TESTIMONIAL                                                                */
/* -------------------------------------------------------------------------- */

function Testimonial() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-[840px] px-6 text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf7f2] text-[#15927d]">
          <span className="text-2xl font-serif leading-none mt-1">“</span>
        </div>

        <blockquote className="text-[24px] font-medium leading-[1.4] tracking-[-0.025em] text-[#25413d] md:text-[30px]">
          “Pharma has completely transformed how we manage inventory and daily checkout. The FEFO tracking alone stopped our expired medicine losses, and the M-Pesa STK push checkout is unmatched.”
        </blockquote>

        <div className="mt-7">
          <div className="text-[13px] font-semibold text-[#173532]">Lead Pharmacist, ABC Chemist</div>
          <div className="mt-1 text-[11px] text-[#899793]">Nairobi, Kenya</div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* CTA                                                                        */
/* -------------------------------------------------------------------------- */

function CTA({ onDemoLogin, demoLoading }: { onDemoLogin: () => void; demoLoading: boolean }) {
  return (
    <section className="px-6 pb-20 bg-white">
      <div className="mx-auto max-w-[1180px] overflow-hidden rounded-2xl border border-[#cfe6df] bg-[#f1faf7]">
        <div className="flex flex-col items-center justify-between gap-8 px-8 py-12 md:flex-row md:px-14">
          <div>
            <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#15927d]">
              Start simply
            </div>
            <h2 className="text-[32px] font-medium tracking-[-0.04em] text-[#173532]">
              Ready to make your day feel lighter?
            </h2>
            <p className="mt-2 text-[13px] text-[#7c8d88]">
              Join Kenyan pharmacies building a clearer, more connected business with Pharma.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onDemoLogin}
              disabled={demoLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-[#138d78] bg-white px-6 py-3.5 text-[13px] font-semibold text-[#138d78] shadow-sm transition hover:bg-[#138d78]/5"
            >
              {demoLoading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={13} className="fill-current" />}
              See Live Demo
            </button>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-[#087e6d] px-7 py-4 text-[13px] font-semibold text-white shadow-lg transition hover:bg-[#066d5f]"
            >
              Create your account
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* FOOTER                                                                     */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-[#e9efed] bg-white">
      <div className="mx-auto max-w-[1180px] px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/pharma-logo.png"
                alt="Pharma"
                width={130}
                height={39}
                className="h-8 w-auto object-contain"
              />
            </div>

            <p className="mt-4 max-w-[230px] text-[11px] leading-5 text-[#879591]">
              The calm, connected operating system for modern pharmacies and chemists in Kenya.
            </p>
          </div>

          <FooterColumn title="Product" links={['Features', 'Pricing', 'Integrations', 'Changelog']} />
          <FooterColumn title="Company" links={['About us', 'Blog', 'Careers', 'Contact']} />
          <FooterColumn title="Support" links={['Help center', 'User Guides', 'Community', 'System Status']} />

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#61736e]">
              Made for Kenya
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="font-bold text-[#079477] text-[13px]">M-PESA</span>
              <span className="font-bold text-[#243d94] text-[13px]">VISA</span>
              <span className="font-bold text-[#d34c35] text-[13px]">MC</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-[#edf1ef] pt-6 text-[10px] text-[#a0aaa7] md:flex-row">
          <span>© 2026 Pharma. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-[#13927d]">Privacy Policy</a>
            <a href="#" className="hover:text-[#13927d]">Terms of Service</a>
            <a href="#" className="hover:text-[#13927d]">Security</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#526863]">{title}</div>
      <div className="mt-4 space-y-2.5 text-[11px]">
        {links.map((link) => (
          <a key={link} href="#" className="block text-[#84928e] transition hover:text-[#13927d]">
            {link}
          </a>
        ))}
      </div>
    </div>
  )
}
