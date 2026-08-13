import { useLayoutEffect, useState } from 'react'
import { SceneCanvas } from './canvas/SceneCanvas'
import { syncThemeBridge, type ThemeName } from './canvas/bridge'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { Hero } from './sections/Hero/Hero'

function App() {
  const [theme, setTheme] = useState<ThemeName>('light')

  useSmoothScroll()

  useLayoutEffect(() => {
    syncThemeBridge(theme)
  }, [theme])

  return (
    <div className="app-shell" aria-label="Portfolio application shell">
      <SceneCanvas />
      <main>
        <Hero
          onThemeToggle={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
          theme={theme}
        />
      </main>
    </div>
  )
}

export default App
