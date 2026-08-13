# Cinematic Scroll Portfolio — Build Spec for Claude Code

**Stack:** React 18 + Vite + TypeScript (strict mode)
**Motion:** GSAP + ScrollTrigger, Lenis (smooth scroll), anime.js (micro-interactions)
**3D:** React Three Fiber + drei + Three.js + postprocessing (bloom, grain, chromatic aberration)
**Identity:** strict black & white, cinematic/minimal, scroll-driven theme inversion, one contained warm-accent moment
**Sections:** Hero, Work, About, Contact (+ case study template)

This is a spec, not a tutorial — it defines decisions, contracts, and constraints that aren't derivable from the codebase itself. Implementation is left to Claude Code; anything below stated as a rule is a rule, not a suggestion to be re-litigated mid-build.

---

## Guiding principle: every effect must justify itself

Every animation, transition, shader, or motion detail in this build must earn its place through at least one of:

- **Communication** — makes information clearer or faster to parse (theme inversion marking a real section boundary, diagram labels naming actual skills, scroll progress cueing position in the page)
- **Interaction** — responds to the user, makes the interface feel alive (magnetic buttons, cursor follower, scroll-scrubbed camera)
- **Identity** — establishes the site's character even without direct utility (grain texture, specific easing curves, the B&W palette itself)

An effect that clears none of these — decorative motion added because it looked cool in isolation, a shader that doesn't track anything meaningful, animation firing just because an element exists — gets cut. This isn't a vibe check, it's a filter to apply to each section as it's built.

**Post-build audit:** run this as an explicit pass after the site is functionally complete, not only as an ongoing gut-check during the build — list every distinct effect in the site and confirm which category(ies) justify it. Anything that can't be assigned a category is a cut candidate, no exceptions for effort already sunk into it.

---

## 0. Visual identity

**Primary identity (~85-95% of site):** strict black & white. Two theme states — `light` (`#ffffff` bg / `#000000` fg) and `dark` (`#000000` bg / `#ffffff` fg) — assigned per-section, not per-component. Sections transition between them via a scroll-driven masked reveal (not a hard cut, not a page-wide filter) as the user scrolls through the boundary zone between two sections.

**Secondary accent (~5-15%, About section only):** a third theme state, `accent` — warm off-white bg (`#e8e4dc`) / charcoal fg (`#2a2824`), monospace annotation font for labels. Modeled on the anime.js homepage's exploded-view technical-diagram aesthetic: thin leader-lines, part labels, restrained motion. This state does **not** use the masked-reveal inversion mechanic — enter/exit it with a simple crossfade, since it should read as a deliberate pause, not another inversion beat.

**Explicitly out of scope for About specifically:** comic-panel layout, illustrated character art, narrow letterboxed columns, any generic anime-style portrait art. The About section's illustration should be an abstract exploded-view form (geometric/technical, §6), not figurative art — figurative art there would pull that section's identity toward "fan site" rather than "developer portfolio." (Hero is the one deliberate exception to "no character content" sitewide — see §3.5 for the astronaut figurine and the reasoning for why it's scoped to Hero only.)

**Grain/noise texture:** used sparingly — hero and section-transition moments only. Never applied globally or as a permanent overlay.

**Theme token contract:** all three states are defined as CSS custom properties (`--bg`, `--fg`, plus `--accent-mono` for the accent state), switched via a `data-theme` attribute set at the section level. Every themed value in CSS and in WebGL derives from these variables — nothing hardcodes a color. The WebGL layer reads the same active-theme value (as a uniform) that drives the DOM, so canvas and page never fall out of sync during a theme transition. This contract is load-bearing for §3 and §4 below — don't let any component bypass it with a locally hardcoded color.

---

## 1. Library ownership boundaries

Overlapping animation libraries is the most common way builds like this turn into a mess. Each library gets an exclusive domain:

| Library | Owns | Never touches |
|---|---|---|
| **Lenis** | The scroll itself — raf loop, easing, virtual scroll position | Any element transform |
| **GSAP + ScrollTrigger** | Everything driven *by* scroll position: pinning, scrubbing, reveal timelines, theme-transition triggers, WebGL camera/uniform sync | Scroll physics, one-off hover/click states |
| **anime.js** | Discrete, non-scroll interactions: hover states, cursor follower, page-load stagger, button/menu micro-motion | Anything scrubbed to scroll position |
| **R3F / Three.js** | The WebGL layer — scene, camera, shaders, mesh/particle systems | DOM layout, text |
| **drei** | R3F helpers (`useTexture`, `Html`, camera controls, `Preload`, etc.) | Anything better hand-rolled for this specific case |
| **postprocessing** (pmndrs, via `@react-three/postprocessing`) | Screen-space FX: bloom, film grain, chromatic aberration, vignette | Scene content itself |

**Rule:** if it's tied to scroll position, it's GSAP's job. If it fires on a discrete event, it's anime.js's job. Never let both animate the same property on the same element — pick one owner per property.

**Lenis + ScrollTrigger sync:** Lenis must be driven from GSAP's ticker rather than running its own independent rAF loop, with `lagSmoothing` disabled on that ticker. This is the detail that most commonly gets skipped and causes jittery desync between smooth-scroll position and ScrollTrigger's internal tracking — treat it as a hard requirement of the scroll setup, not an optimization.

---

## 2. Folder structure

```
src/
├── main.tsx
├── App.tsx
├── router.tsx                     # case-study routes
│
├── canvas/                        # ALL R3F/Three.js lives here, isolated
│   ├── SceneCanvas.tsx            # single <Canvas> instance, mounted once at App root
│   ├── scenes/                    # swappable scene contents (Hero scene, transition scene, etc.)
│   ├── materials/                 # toon/wireframe shader materials (§3.5), theme-aware
│   ├── shaders/                   # .glsl sources
│   └── hooks/                     # scroll->uniform bridge, theme->uniform bridge
│
├── public/
│   └── models/                    # Blender-exported .glb files (Hero, About core)
│
├── components/
│   ├── layout/                    # Header, Footer, custom cursor
│   ├── ui/                        # SplitText wrapper, MagneticButton, Marquee, etc.
│   └── transitions/                # page/section transition components
│
├── sections/
│   ├── Hero/
│   ├── Work/                      # includes ProjectCard
│   ├── About/                     # includes ExplodedCore (3D wireframe model, Blender-authored)
│   └── Contact/
│
├── pages/
│   ├── Home.tsx                   # composes all sections
│   └── CaseStudy.tsx              # template, dynamic route
│
├── hooks/                         # useSmoothScroll, useGSAP wrapper, useMediaQuery, useTheme
├── lib/                           # gsap.ts (plugin registration, once), constants.ts
├── data/                          # typed placeholder content (projects, etc.)
├── styles/                        # global.css, typography.css, variables.css (theme tokens)
└── types/
```

**Structural rules, not just organization:**
- `canvas/` is fully isolated from DOM component concerns — no Three.js imports outside this directory.
- Each section owns an adjacent `*.animations.ts` (or `.ts` file with a clear name) holding its GSAP timeline logic, kept out of JSX — components stay declarative, timelines stay reviewable as a unit.
- Plugin registration (`ScrollTrigger`, `SplitText`, etc.) happens in exactly one place (`lib/gsap.ts`), imported everywhere else. Registering a plugin more than once, or in component-local code, is a bug.

---

## 3. The single-canvas rule

Exactly **one** `<Canvas>` exists in the app, mounted once at the App root, positioned fixed/full-viewport behind DOM content. What renders inside it swaps based on active section/route — canvases are never mounted or unmounted per-section.

**Why this is a hard rule, not a preference:** browsers cap concurrent WebGL contexts (commonly ~8-16), and mounting/unmounting `<Canvas>` per section causes context-loss flicker well before that cap. A single shared renderer also means one consistent DPR/performance budget instead of competing render loops, and it's what makes the scroll-synced camera/uniform work in §4 tractable — there's one scene graph to drive, not several.

---

## 3.5. Authored 3D models (Blender) — replacing procedural/code-generated WebGL content

Hero and About's core model are **hand-authored in Blender**, not procedurally generated in code. This is a deliberate choice for human touch and craft — Claude Code's job is to build the pipeline and shader contract these models render through, not to generate placeholder geometry that gets treated as final.

**Hero object: an astronaut figurine** — a stylized character, not photorealistic, not the abstract geometric form considered earlier in planning. Chosen over an abstract form because a character gives Hero an actual narrative "moment" (drifting, tumbling, reacting) that pure geometry can't provide as directly, and an astronaut specifically has a strong graphic silhouette (helmet, suit paneling) that toon-shades cleanly without needing a face or figurative detail that would clash with the site's abstraction elsewhere.

**Hero behavior — scroll-driven pose change, not idle rotation:** the astronaut's pose itself changes as a function of scroll progress (e.g. loose/tumbling drift early in the Hero section, resolving toward a more settled/grounded pose as the section completes) rather than simply rotating a static pose. This requires either a rigged model with pose-blend targets driven by the scroll progress value (§4's bridge), or several discrete poses cross-faded/blended along the scroll range — Claude Code's call on implementation, but the pose must visibly change with scroll, not just orientation.

**About's core stays abstract/geometric — deliberately does NOT relate to or reuse the astronaut.** Reasoning: the astronaut is a character with narrative weight; reusing it in About would turn a calm skills-diagram into an illustrated scene, which fights the section's own register (§6). It would also dilute the astronaut's impact — appearing once in Hero makes it a statement, appearing twice makes it a mascot. Practically, a rigged character doesn't support the "parts explode from a center, representing skill categories" metaphor at all — that metaphor needs an object, not a body.

**Two render techniques, split by section register — not a single house style:**

| Section | Technique | Why |
|---|---|---|
| **Hero** | 2-tone toon/posterize shader — hard black/white threshold, zero gradient steps (1-2 step toon ramp, no midtones, no standard lighting falloff) | Hero needs graphic presence, a "moment" — reference is a hard-threshold toon-shaded character render (solid black/white regions following form, not just outline) |
| **About core** | Pure line/wireframe — edges only, no fill (`EdgesGeometry` + `LineSegments`, or a toon-outline shader if slightly thicker stylized lines are wanted) | About is the calm, technical-diagram register (§6) — a toon-shaded render would be visually loud in a section meant to read as a quiet pause. Wireframe is also the closest technical match to the anime.js reference's actual line-art medium. |

**Shared shader contract (both techniques must satisfy this — it's the actual hard requirement):**
- Zero gray, zero standard PBR/lit-material lighting falloff. Neither technique should ever produce a mid-tone — toon shading is explicitly clamped to 2 steps forced to pure black/pure white, wireframe has no fill at all.
- Both materials derive their color from the active theme's `--bg`/`--fg` pair (§0), not hardcoded black/white — this is what makes the theme-inversion transition (light section → dark section) work correctly on a 3D model: it's a material color swap, not a relighting problem, because there's no lighting model to invert in the first place.
- Both remain scroll-reactive per the existing bridge pattern (§4) — rotation/position/pose-blend/explode-progress driven by scroll progress, read inside the R3F render loop.

**Asset pipeline:** Blender models exported as `.glb`, compressed via `gltf-transform`/`gltfjsx` (already specified in §10's asset pipeline — this is now load-bearing, not optional), loaded through `drei`'s `useGLTF`/`Preload`. Model complexity (poly count, part count for About's exploded core) is the person's call when modeling in Blender — Claude Code should build the loading/shader/animation pipeline to accept whatever geometry arrives, not assume a specific model in advance.

**What Claude Code should NOT do:** generate placeholder procedural geometry (primitives, noise-displaced meshes, particle systems standing in for "the model") for Hero or About and treat it as final content. Scaffold the pipeline (loader, shader material, scroll-binding) against a temporary primitive if needed to develop against before the real `.glb` exists, but this must be clearly marked as a placeholder to swap, not shipped as the actual hero content.

---

## 4. Scroll → theme → WebGL bridge

This is the core "advanced" mechanic of the build: both the theme-inversion transitions (§0) and any scroll-scrubbed WebGL motion are driven off the same scroll-progress signal, read via `ScrollTrigger`, and pushed into the R3F layer.

**Contract, not implementation:**
- Scroll progress for a given section is exposed as a value (ref or store) that R3F components read inside their render loop — never inside React state/re-render, since that's too slow for per-frame updates.
- The active `data-theme` value is exposed the same way, so a mesh/shader can react to a theme transition exactly in sync with the DOM's CSS-variable swap — no independent timing.
- `scrub` (boolean or numeric lag) is what ties an animation to scroll position rather than scroll *events*; this is what makes scroll-scrubbed WebGL feel physically connected instead of triggered on a threshold.

Claude Code should design the specific hook/store shape; the requirement is that DOM theme state and WebGL theme state are provably the same source of truth, not two values kept in parallel.

---

## 5. Section-by-section build order

Each stage should be independently demoable — build in this order:

1. **Foundation** — Vite+TS scaffold, Lenis+ScrollTrigger sync, theme tokens (all three states), fluid type scale, fonts loaded.
2. **Hero** — strict B&W only (not the accent theme). Static layout first, then GSAP load-in timeline, then the WebGL layer behind it. This section sets the bar the rest of the site has to match — prioritize getting the feel right here over speed.
3. **Work** — scroll-driven gallery (pin + scrub is the expected pattern here). Placeholder project cards from typed data, each tagged with the real technologies used on that project — this is where full stack specificity (TypeScript, NestJS, FastAPI, Kubernetes, Terraform, RAG/AI agents, etc.) actually surfaces, not in About.
4. **About** — the one accent-theme section. Typography-led, plus the exploded-core model (§3.5, §6) — now a Blender-authored 3D model rendered as pure wireframe/line-art, not the SVG diagram originally planned. Built after Hero/Work so the primary visual language is already locked, making it easier to judge whether the accent reads as an accent and not a competing theme.
5. **Contact** — anime.js-driven micro-interactions (magnetic buttons etc.), optional closing WebGL moment.
6. **Case study template** — reuses the established pattern language: transition in, scroll-driven content blocks.
7. **Page/section transitions** — tuned last, once there's real content to transition between.
8. **Polish pass** — cursor, loading state, resize/orientation edge cases, reduced-motion fallback (§8).

---

## 6. About section: exploded-view core (accent theme)

- **Format change from earlier draft:** this is now a Blender-authored 3D model (§3.5), rendered as pure wireframe/line-art in the WebGL canvas — not a Claude-Code-generated SVG. The structural/content requirements below still apply; only the medium changed.
- **The object:** a stylized central "core," not a literal machine (no server rack, no camera lens). Structure is radial: one center point/form, with 5-7 parts arranged around it that explode outward on scroll and re-assemble inward on scroll-back. The center is the natural place for a personal mark (name, initials, or a simple glyph) — the parts read as "things that compose what I build," radiating from that center, rather than a layered stack diagram (which is more literal/generic and doesn't earn its place beyond looking technical). Fully abstract/geometric form, not figurative, not a recognizable real-world object — the shape exists to support the radial-parts structure, not to resemble anything specific. Exact geometry and poly count are the person's call when modeling in Blender.
- **What each part represents:** a symbolic skills overview, not an exhaustive inventory. The person has 50+ real skills across full-stack, infrastructure, and AI — the diagram is not the place to list them all; its job is identity (see guiding principle above), establishing how the person thinks about their own stack, not cataloguing it.
- **Grouping:** skills collapse into 5-7 categories, each mapped to one radiating part (e.g. Frontend, Backend, Data & Infra, DevOps/Cloud, AI/ML, Architecture). Each part is labeled with the category name (DOM/HTML overlay via `drei`'s `Html`, or a separate SVG/text layer positioned against the 3D model's screen-space coordinates — Claude Code's call); 2-3 representative skills may appear as smaller sub-labels per part, echoing the anime.js reference's `waapi / timeline / stagger / svg` annotation style. This is a curation exercise — pick the skills most representative of each category, not the longest list that fits.
- **Full skill depth lives elsewhere, not here:** the actual granular stack (TypeScript, React, Next.js, Node.js, NestJS, Python, FastAPI, PostgreSQL, Redis, AWS, Docker, Kubernetes, Terraform, CI/CD, distributed systems, event-driven architecture, OAuth 2.0/OIDC, LLM APIs/RAG/AI agents, etc.) is surfaced through **Work section project tags** instead — each project card tags the specific technologies used on that project, which communicates real specificity in context rather than as a disconnected badge wall. Do not duplicate the full list in About.
- **Render technique:** pure line/wireframe (§3.5) — no fill, no gradient, no standard lighting model. Color derives from the active theme's `--bg`/`--fg` pair.
- **Motion:** center + parts draw on first (stroke/line-reveal animation, scroll-scrubbed), then parts separate radially outward from the center as the section enters view; category + sub-labels stagger in per-part once separation completes. Scrolling back reverses the sequence — parts return toward center, which is the payoff of choosing a radial structure over a linear/stacked one.
- **Model requirement for Blender export:** the center and each radiating part must be separate named objects/groups in the `.glb` export, so each part can be targeted independently by the scroll-driven animation layer (position/rotation per part, not one rigid mesh).

---

## 7. Typography

- Variable font for body/UI, separate custom display font for headlines — both loaded as `woff2` variable fonts (weight-range `@font-face`, not fixed-weight files).
- Fluid type scale via `clamp()` for display/heading/body sizes — no fixed breakpoint jumps in font size.
- Placeholder fonts until real ones are licensed: a Neue-Montreal/Founders-Grotesk-style geometric sans for display, Inter Variable or General Sans for body. Swappable later without restructuring anything, since only the `@font-face` source changes.
- `SplitText`-style char/word/line splitting (GSAP's paid plugin, or the `split-type` package as a free alternative) is used for headline reveal animations — build one reusable wrapper component early since most sections need it.

---

## 8. Performance & accessibility — non-negotiable at this quality bar

An Awwwards-tier site that janks on a mid-range laptop or breaks accessibility basics fails the actual goal, not just a checklist:

- **`prefers-reduced-motion`**: detected and respected — scroll-scrubbed animation and parallax degrade to simple fades, navigation itself is never disabled.
- **Mobile**: pin/scrub-heavy sections (especially Work's horizontal scroll) need a genuinely simplified mobile variant — real horizontal ScrollTriggers fight touch scroll physics. Plan the mobile branch per-section, don't retrofit it.
- **WebGL budget**: DPR capped at 2, `powerPreference: 'high-performance'`, with a low-power fallback path (reduced particle count / disabled postprocessing) for lower-tier GPUs.
- **GSAP cleanup**: every timeline goes through `@gsap/react`'s `useGSAP()` hook, not raw `useEffect` — this auto-reverts on unmount and auto-scopes selectors, which is what prevents duplicate `ScrollTrigger` instances on hot reload or route change.
- **Loading state**: fonts and critical WebGL assets preload before the Hero reveal fires — a font pop-in mid-animation reads as broken, not cinematic.
- **Lighthouse/PageSpeed**: checked after every major section is built, not only at the end — WebGL + heavy fonts + grain textures degrade scores fast, and it's much cheaper to catch that per-section than to debug a slow site holistically at the end.

---

## 9. Dependencies

Core: `gsap`, `@gsap/react`, `lenis`, `three`, `@react-three/fiber`, `@react-three/drei`, `postprocessing`, `@react-three/postprocessing`, `animejs`, plus `@types/three` and `@types/animejs` as dev dependencies.

`@react-three/postprocessing` is the declarative-JSX entry point for bloom/grain/chromatic-aberration; reach for the underlying `postprocessing` package directly only where fine control isn't achievable through the wrapper.

Plugin registration (`ScrollTrigger`, and `SplitText` if using the paid Club GSAP version) happens once, at import time, in `lib/gsap.ts` — never per-component.

**glTF tooling is required, not optional**, now that Hero and About both depend on authored Blender models (§3.5): `gltf-transform` (or `gltfjsx` CLI) for compressing/converting `.glb` exports before they're loaded — raw uncompressed exports directly from Blender should never be loaded as-is.

---

## 10. Production workflow (solo, small-scope calibration)

Real tooling, calibrated to not be bureaucratic overhead for a solo/small-scope build:

**Code quality (set up day one):**
- ESLint + Prettier + `eslint-plugin-react-hooks`, with Husky + `lint-staged` running `eslint --fix` and `prettier --write` on a pre-commit hook.
- TypeScript `strict: true` from the start — retrofitting strict mode later is far more painful than starting with it.

**Deployment:** Vercel or Netlify connected directly to the GitHub repo, preview URL per branch push (this matters specifically for checking scroll/WebGL behavior on real mobile hardware, which local desktop dev won't surface), `main` auto-deploys to production. No staging environment needed at this scope.

**Environment hygiene:** `.env.example` committed even if currently empty; `.nvmrc` pinning Node version.

**Asset pipeline:** images/textures optimized pre-build (WebGL textures and hero imagery are the usual actual page-weight problem here, not JS bundle size); any 3D models beyond procedural geometry compressed/converted via `gltf-transform`/`gltfjsx` rather than loaded as raw `.glb`.

**Skip at this scope:** unit test suites (low ROI on a visual/animation-heavy site — most bugs here are visual and caught faster by eyeballing preview deploys), multi-environment CI, Storybook, monorepo tooling.

**Don't skip regardless of scope:** a Lighthouse pass per major section (see §8).

---

## 11. Session/context management — required project files

Claude Code must create and maintain the following structure at the project root, **before or during initial scaffolding** (§5 stage 1):

```
project/
├── AGENTS.md
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PROJECT_CONTEXT.md
│   ├── DECISIONS.md
│   └── TASKS.md
```

This exists because the build spans multiple sessions and a fresh session has no memory of prior ones — these files are how continuity is maintained, not this planning document (which is a one-time input, not a living project file). Each file has a distinct job; don't collapse them into one another.

- **`AGENTS.md`** — the hard constraints an agent must check before making changes: the library ownership boundaries (§1), the single-canvas rule (§3), the theme-token contract (§0), the "every effect must justify itself" principle. This is a rules file, read at the start of every session, not a narrative.
- **`docs/ARCHITECTURE.md`** — the durable "why": derived from this spec, but written as living documentation of the system as actually built, not a copy of the original plan. Update it when architecture actually changes, not on every commit.
- **`docs/PROJECT_CONTEXT.md`** — current state only: what's built, what's in progress, what's not started, keyed roughly to §5's section-by-section build order. This file goes stale fastest, so keep it short and mechanically updated (a status table, not prose) rather than letting it accumulate narrative.
- **`docs/DECISIONS.md`** — an append-only log of judgment calls and their reasoning (e.g. "Hero uses a character, not an abstract form, because—"), so a later session doesn't silently re-litigate or drift from a decision already made deliberately. Append, don't rewrite history here.
- **`docs/TASKS.md`** — the actual work queue, structured around §5's build order, checked off as sections complete.

**Update discipline:** `PROJECT_CONTEXT.md` and `TASKS.md` should be updated at the end of any session that changes project state — treat this as part of finishing the work, not optional housekeeping. `DECISIONS.md` gets an entry whenever a judgment call is made that a future session could plausibly reverse without this context (render technique choices, object/content decisions, scope cuts). `ARCHITECTURE.md` and `AGENTS.md` change rarely, only when the actual system architecture or hard constraints shift.

---

## 12. First milestone

Build **Hero to completion** before touching Work/About/Contact: Lenis+ScrollTrigger sync working, GSAP load-in timeline, one real WebGL element responding to scroll, strict B&W theme only (no accent theme yet). This section establishes the site's primary identity and motion contract — it's the highest-leverage single piece of the build, and it's what most of the "does this actually read as Awwwards-level" judgment will hinge on. The About section's accent-theme diagram is deliberately sequenced later (§5), once the primary black-and-white language is locked and there's a baseline to judge the accent against.
