import type { ThemeName } from '../../canvas/bridge'
import './Hero.css'

type HeroProps = {
  onThemeToggle: () => void
  theme: ThemeName
}

export function Hero({ onThemeToggle, theme }: HeroProps) {
  return (
    <section className="hero" data-theme={theme} id="top">
      <div className="hero__content">
        <div className="hero__meta">
          <span>01 / 01</span>
          <button
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="hero__theme-toggle"
            onClick={onThemeToggle}
            type="button"
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        <h1 className="hero__title"></h1>

        <div className="hero__footer">
          <p>
            A portfolio of considered interfaces, resilient products, and the systems behind them.
          </p>
          <a href="#work">
            Explore selected work <span aria-hidden="true">&#8595;</span>
          </a>
          <span className="hero__scroll">Scroll to begin</span>
        </div>
      </div>
    </section>
  )
}
