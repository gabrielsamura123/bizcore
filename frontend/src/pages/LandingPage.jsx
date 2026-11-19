import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CloudOff,
  Home,
  LayoutGrid,
  LogIn,
  Moon,
  PackageSearch,
  Smartphone,
  Sun,
  Tag,
  UserPlus,
} from 'lucide-react'
import BottomTabBar from '@/components/BottomTabBar'
import DashboardPreview3D from '@/components/DashboardPreview3D'
import Logo from '@/components/Logo'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/context/ThemeContext'

const features = [
  {
    icon: Building2,
    title: 'Multi-tenancy built in',
    description:
      'Run multiple businesses from one account. Every record is isolated by business, so your branches and tenants never mix.',
  },
  {
    icon: PackageSearch,
    title: 'Inventory tracking',
    description:
      'Know what is on the shelf, what is selling, and what needs restocking before you run out.',
  },
  {
    icon: Smartphone,
    title: 'Mobile money readiness',
    description:
      'Designed for Orange Money and Africell Money workflows that Sierra Leone customers already use every day.',
  },
  {
    icon: CloudOff,
    title: 'Offline reliability',
    description:
      'Keep serving customers when the connection drops. Your sales sync up when you are back online.',
  },
]

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('home')
  const { isDark, toggleTheme } = useTheme()

  const bottomItems = [
    {
      label: 'Home',
      icon: Home,
      to: '/',
      active: activeSection === 'home',
      onClick: () => {
        setActiveSection('home')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },
    },
    {
      label: 'Features',
      icon: LayoutGrid,
      href: '#features',
      active: activeSection === 'features',
      onClick: () => setActiveSection('features'),
    },
    {
      label: 'Pricing',
      icon: Tag,
      href: '#pricing',
      active: activeSection === 'pricing',
      onClick: () => setActiveSection('pricing'),
    },
    {
      label: 'Theme',
      icon: isDark ? Sun : Moon,
      onClick: toggleTheme,
    },
    {
      label: 'Log In',
      icon: LogIn,
      to: '/login',
    },
    {
      label: 'Start',
      icon: UserPlus,
      to: '/register',
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 transition-colors duration-300 dark:bg-neutral-950 md:pb-0">
      <header className="pointer-events-none fixed inset-x-0 top-5 z-50 hidden justify-center px-4 md:flex">
        <nav className="liquid-glass pointer-events-auto flex h-14 w-full max-w-5xl items-center justify-between rounded-2xl px-4 sm:px-5">
          <div className="relative z-10">
            <Logo />
          </div>

          <div className="relative z-10 hidden items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-300 md:flex">
            <a
              href="#features"
              className="transition hover:text-neutral-900 dark:hover:text-white"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="transition hover:text-neutral-900 dark:hover:text-white"
            >
              Pricing
            </a>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="rounded-full border border-neutral-200/80 bg-white/60 px-3 py-2 text-sm font-semibold text-neutral-800 backdrop-blur transition hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-neutral-100 dark:hover:bg-white/10 sm:px-4"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-neutral-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 sm:px-4"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <BottomTabBar items={bottomItems} />

      <main>
        <section id="home" className="relative overflow-hidden px-5 pb-20 pt-24 sm:pt-40">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-neutral-200/40 blur-3xl dark:bg-white/5" />
          <div className="relative mx-auto max-w-6xl text-center">
            <div
              data-aos="fade-down"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-300/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-neutral-800 backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-neutral-100"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white" />
              Built for Sierra Leone businesses
            </div>
            <h1
              data-aos="fade-up"
              data-aos-delay="100"
              className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-neutral-900 dark:text-white sm:text-5xl lg:text-6xl"
            >
              The Cloud POS Built for{' '}
              <span className="text-neutral-500 dark:text-neutral-300">
                Sierra Leone
              </span>{' '}
              Businesses
            </h1>
            <p
              data-aos="fade-up"
              data-aos-delay="200"
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-lg"
            >
              Sell faster, track stock accurately, and understand your cash flow
              from one calm, reliable workspace — in the cloud and on the go.
            </p>
            <div
              data-aos="fade-up"
              data-aos-delay="300"
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link to="/register" className="btn-primary w-full sm:w-auto">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary w-full sm:w-auto">
                Log In
              </Link>
            </div>
            <p
              data-aos="fade-up"
              data-aos-delay="350"
              className="mt-4 text-xs text-neutral-500 dark:text-neutral-300"
            >
              No credit card required · Set up in minutes
            </p>
          </div>

          <div
            data-aos="fade-up"
            data-aos-delay="400"
            className="relative mx-auto mt-16 max-w-5xl px-2 sm:mt-20"
          >
            <div className="pointer-events-none absolute inset-x-0 -inset-y-16">
              <div className="liquid-spotlight h-full w-full blur-2xl" />
            </div>
            <DashboardPreview3D />
          </div>
        </section>

        <section
          id="features"
          className="border-y border-neutral-200/80 bg-white/60 px-5 py-20 backdrop-blur dark:border-white/10 dark:bg-black/20"
        >
          <div className="mx-auto max-w-6xl">
            <div data-aos="fade-up" className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-neutral-700 dark:text-neutral-300">
                Features
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                Everything your business needs, nothing it doesn't
              </h2>
              <p className="mt-4 text-neutral-600 dark:text-neutral-300">
                Practical tools designed around how shops, supermarkets, and
                growing businesses actually operate.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <article
                    key={feature.title}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                    className="card p-6 transition duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                      {feature.description}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-5 py-20">
          <div data-aos="fade-up" className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-neutral-700 dark:text-neutral-300">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Start free, grow when you are ready
            </h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-300">
              Phase 1 access is open for early users. Talk to us about plans for
              multiple branches and additional team members.
            </p>
            <Link to="/register" className="btn-primary mt-8 inline-flex">
              Create your account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200/80 py-8 dark:border-white/10">
        <div
          data-aos="fade-up"
          className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-neutral-500 dark:text-neutral-300 sm:flex-row"
        >
          <Logo />
          <p>Made with care for Sierra Leone businesses.</p>
          <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
            <CheckCircle2 className="h-4 w-4" />
            Secure JWT sessions
          </div>
        </div>
      </footer>
    </div>
  )
}
