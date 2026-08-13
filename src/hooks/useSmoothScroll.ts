import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'

export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
    })

    const updateScrollTrigger = () => ScrollTrigger.update()
    const tick = (time: number) => lenis.raf(time * 1000)

    lenis.on('scroll', updateScrollTrigger)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', updateScrollTrigger)
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])
}
