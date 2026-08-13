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
