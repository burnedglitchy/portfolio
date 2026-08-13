import { useRef } from 'react'
import type { ThemeName } from '../../canvas/bridge'
import { useHeroAnimations } from './Hero.animations'
import './Hero.css'

type HeroProps = {
  onThemeToggle: () => void
  theme: ThemeName
}

export function Hero({ onThemeToggle, theme }: HeroProps) {
  const section = useRef<HTMLElement>(null)

  useHeroAnimations({ section })

  return (
    <section ref={section} className="hero" data-theme={theme} id="top">
      <div className="hero__content" data-hero-content>
        <div className="hero__meta" data-hero-index>
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

        <div className="hero__headline" aria-label="Designing digital systems that feel inevitable">
          <span data-hero-line>Designing</span>
          <span data-hero-line>digital systems</span>
          <span data-hero-line>that feel inevitable.</span>
        </div>

        <div className="hero__footer">
          <p data-hero-copy data-hero-detail>
            A portfolio of considered interfaces, resilient products, and the systems behind them.
          </p>
          <a data-hero-detail href="#work">
            Explore selected work <span aria-hidden="true">&#8595;</span>
          </a>
          <span className="hero__scroll" data-hero-scroll>
            Scroll to reorient
          </span>
        </div>
      </div>
    </section>
  )
}
