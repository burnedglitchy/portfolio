# Project Context

| Area       | Status      | Notes                                                                                                                                               |
| ---------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation | Complete    | GSAP plugin registration, Lenis/ScrollTrigger synchronization, and the DOM-to-WebGL theme bridge are implemented.                                   |
| Hero       | Complete    | Pinned desktop astronaut pose sequence, static mobile/reduced-motion fallback, light/dark inversion, and corrected canvas layering are implemented. |
| Work       | Not started | Follows Hero completion.                                                                                                                            |
| About      | Not started | Accent-theme exploded-view core follows Work.                                                                                                       |
| Contact    | Not started | Final primary section.                                                                                                                              |

## Current Focus

Build Work after validating Hero's visual composition and the astronaut asset's runtime performance. The astronaut now loads from `public/models/astronaut.glb` and paints between the page background and Hero content.
