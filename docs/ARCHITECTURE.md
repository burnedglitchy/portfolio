# Architecture

## Application Shape

The application is a Vite React 18 single-page portfolio written in strict TypeScript. DOM sections compose the page while one root-level React Three Fiber canvas renders all WebGL content.

## Motion Ownership

| Concern                                    | Owner                        |
| ------------------------------------------ | ---------------------------- |
| Smooth-scroll physics                      | Lenis                        |
| Scroll-linked timelines, pins, and reveals | GSAP + ScrollTrigger         |
| Hover, click, and other discrete motion    | anime.js                     |
| WebGL scenes and render-loop updates       | React Three Fiber + Three.js |

Lenis is synchronized through GSAP's ticker. Scroll values and the active theme are bridged to canvas code through refs or a store so render-loop updates never require React re-renders.

## Theme Contract

Themes are section-level `data-theme` states. CSS owns the source tokens `--bg`, `--fg`, and `--accent-mono`; WebGL reads the current theme through the shared bridge. Components must not introduce local theme colors.

## Source Boundaries

- `src/canvas/` contains every Three.js and R3F import, including scene content, materials, shaders, and canvas bridges.
- `src/sections/` owns section markup and adjacent GSAP animation modules.
- `src/lib/gsap.ts` is the only GSAP plugin-registration site.
- `public/models/` contains Blender-exported, optimized `.glb` assets.

## Performance and Accessibility

The canvas will cap DPR at 2 and use a low-power fallback when required. Motion must honour `prefers-reduced-motion`. Heavy pinned or scrubbed experiences receive a mobile fallback.
