# Decisions

Append new entries; do not rewrite prior history.

## 2026-08-13 - Foundation uses React 18

The project is pinned to React 18 to match the build specification. The initial application shell intentionally contains no section UI or canvas content; Hero remains the first visual implementation milestone.

## 2026-08-13 - Theme tokens are established before components

The three theme states are defined with CSS custom properties from the start so section and WebGL work can share one source of truth rather than retrofitting theme ownership later.

## 2026-08-13 - React 18-compatible R3F stack

React Three Fiber 9 requires React 19, so the 3D packages use the latest compatible R3F 8, drei 9, and postprocessing 2 major lines. This preserves the plan's React 18 constraint without overriding peer dependency checks.

## 2026-08-13 - Hero uses rig-bone interpolation

The supplied Hero astronaut contains a Blender-exported skeleton but no animation clips. Hero therefore interpolates a small set of authored rig bones from a loose drift pose to a settled pose using the shared scroll-progress ref. This satisfies the pose-change requirement without introducing procedural replacement geometry or separate pose assets.

## 2026-08-13 - Canvas paints between page background and Hero content

The fixed root canvas uses a visual layer above the document background, while Hero text uses the next layer above it. Hero does not paint an opaque background, preventing it from hiding the WebGL scene.

## 2026-08-14 - Hero headline reveals from the billboard at beat 6

The Hero's display headline is hidden at scroll-zero and reveals only when the astronaut activates the stock billboard during beat 6. It is intentionally full-viewport dominant typography, not small sign copy: scale and reveal timing serve different jobs. Both the astronaut pose and headline reveal consume the same GSAP-fed scroll-progress bridge so their causal relationship cannot drift.

## 2026-08-14 - Hero rebuild proceeds through independently verifiable stages

The prior integrated Hero implementation was removed before the rebuild. The canvas background and camera stage now stands on its own, so shader, asset, scroll-bridge, and pose work can be validated independently without retaining behavior from the previous Hero.

## 2026-08-14 - Hero assets share one unlit theme-aware shader

The astronaut and every billboard mesh use one `ShaderMaterial` with a binary normal threshold. The shader has no PBR source-material fallback or lighting setup, and its two output colors are read from the same `--bg` and `--fg` bridge as the DOM. This keeps both assets visually coherent and makes a future theme inversion a uniform update rather than a material replacement.

## 2026-08-14 - Hero framing normalizes authored asset units in composition code

The astronaut and billboard exports have different native unit scales, so their relationship is normalized at their scene groups rather than by modifying either GLB. The static camera uses a wider 42-degree field of view and a 13.5-unit distance, aimed above the origin, to keep the billboard structure and astronaut readable together without adding camera motion.
