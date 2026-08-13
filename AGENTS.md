# Agent Constraints

Read this file before changing the project.

## Non-Negotiable Rules

- Every visual effect must serve communication, interaction, or identity.
- Lenis owns scroll physics. GSAP and ScrollTrigger own scroll-driven animation. anime.js owns discrete interactions. Never allow two libraries to animate the same property.
- Drive Lenis from the GSAP ticker and disable GSAP ticker lag smoothing. Do not add a second requestAnimationFrame loop for Lenis.
- Mount exactly one React Three Fiber `<Canvas>` at the application root. All Three.js and R3F imports belong inside `src/canvas/`.
- Define all theme colors with CSS custom properties. Section themes use `data-theme`; WebGL must consume the active theme through the same bridge and must not hardcode theme colors.
- Register GSAP plugins once in `src/lib/gsap.ts`. Component-local plugin registration is a bug.
- Keep GSAP timelines in each section's adjacent animation file, not JSX. Use `@gsap/react`'s `useGSAP` for cleanup.
- Hero and About use Blender-authored `.glb` assets. Do not substitute procedural geometry for their finished content.
- Respect `prefers-reduced-motion`, mobile fallbacks for expensive pinned/scrubbed scenes, and the WebGL performance budget.
- Update `docs/PROJECT_CONTEXT.md` and `docs/TASKS.md` whenever project state changes. Append judgment calls to `docs/DECISIONS.md`.
