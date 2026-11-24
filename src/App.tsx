import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { GameProvider, useGameContext } from '@/providers/GameProvider'
import { SettingsProvider } from '@/providers/SettingsProvider'

/**
 * Route-level code splitting: the landing page ships in the first chunk, the
 * rest of the experience streams in as the visitor commits to it.
 */
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const WarningPage = lazy(() => import('@/pages/WarningPage'))
const RegistrationPage = lazy(() => import('@/pages/RegistrationPage'))
const TestPage = lazy(() => import('@/pages/TestPage'))
const ArchivePage = lazy(() => import('@/pages/ArchivePage'))
const ConfrontationPage = lazy(() => import('@/pages/ConfrontationPage'))
const RevelationPage = lazy(() => import('@/pages/RevelationPage'))
const EndingPage = lazy(() => import('@/pages/EndingPage'))

/** Route guard: keeps a fresh visitor on the landing page and a finished
 *  witness on their report, without ever trapping them. */
function RouteWatcher() {
  const { progress } = useGameContext()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    const gated = ['/session', '/archive', '/confrontation', '/revelation', '/ending']
    if (!gated.includes(path)) return

    if (!progress.registered) {
      navigate('/', { replace: true })
      return
    }
    if (path === '/ending') {
      if (!progress.ending) navigate(progress.answers.length >= 15 ? '/session' : '/', { replace: true })
      return
    }
    if (['/archive', '/confrontation', '/revelation'].includes(path) && progress.answers.length < 15) {
      navigate('/session', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, progress.registered, progress.answers.length])

  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

/** Shown for the split second a route chunk is fetched. */
function StageLoader() {
  return (
    <div className="grid min-h-[100svh] place-items-center bg-ink">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-pulse rounded-full border border-surveil/40" />
        <p className="text-[10px] tracking-[0.34em] text-surveil/70">جارٍ الاتصال بالجناح المغلق…</p>
      </div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <Suspense fallback={<StageLoader />}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/start" element={<WarningPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/session" element={<TestPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/confrontation" element={<ConfrontationPage />} />
          <Route path="/revelation" element={<RevelationPage />} />
          <Route path="/ending" element={<EndingPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <GameProvider>
        <ScrollToTop />
        <RouteWatcher />
        <AnimatedRoutes />
      </GameProvider>
    </SettingsProvider>
  )
}
