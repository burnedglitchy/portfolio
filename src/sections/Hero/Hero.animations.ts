import { useGSAP } from '@gsap/react'
import type { RefObject } from 'react'
import { sceneBridge } from '../../canvas/bridge'
import { gsap } from '../../lib/gsap'

type HeroAnimationOptions = {
  section: RefObject<HTMLElement>
}

export function useHeroAnimations({ section }: HeroAnimationOptions) {
  useGSAP(
    () => {
      const hero = section.current

      if (!hero) {
        return
      }

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const mobile = window.matchMedia('(max-width: 700px)').matches
      const scope = hero.querySelector<HTMLElement>('[data-hero-content]')

      if (!scope) {
        return
      }

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro
        .fromTo(
          scope.querySelector('[data-hero-index]'),
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, duration: 0.45, y: 0 },
        )
        .fromTo(
          scope.querySelectorAll('[data-hero-line]'),
          { autoAlpha: 0, yPercent: 105 },
          { autoAlpha: 1, duration: 0.9, stagger: 0.1, yPercent: 0 },
          '-=0.15',
        )
        .fromTo(
          scope.querySelectorAll('[data-hero-detail]'),
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, duration: 0.5, stagger: 0.08, y: 0 },
          '-=0.35',
        )

      if (reducedMotion || mobile) {
        sceneBridge.heroProgress.current = 0.82
        return
      }

      const scroll = gsap.timeline({
        scrollTrigger: {
          end: '+=260%',
          onUpdate: (trigger) => {
            sceneBridge.heroProgress.current = trigger.progress
          },
          pin: true,
          scrub: 0.8,
          start: 'top top',
          trigger: hero,
        },
      })

      scroll
        .to(scope.querySelector('[data-hero-index]'), { autoAlpha: 0.35, y: -16 }, 0)
        .to(
          scope.querySelectorAll('[data-hero-line]'),
          { letterSpacing: '0.06em', xPercent: -3 },
          0.08,
        )
        .to(scope.querySelector('[data-hero-copy]'), { autoAlpha: 0.25, y: -28 }, 0.38)
        .to(scope.querySelector('[data-hero-scroll]'), { autoAlpha: 0, y: 12 }, 0.68)
    },
    { scope: section },
  )
}
