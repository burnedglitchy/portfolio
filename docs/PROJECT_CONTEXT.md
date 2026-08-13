# Project Context

| Area       | Status      | Notes                                                                                                                                                          |
| ---------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation | Complete    | GSAP plugin registration, Lenis/ScrollTrigger synchronization, and the DOM-to-WebGL theme bridge are implemented.                                              |
| Hero       | In progress | Tasks 1-3 complete: the root canvas has a theme-synced stage, shared two-tone shader, and a measured full-scale astronaut/billboard composition. |
| Work       | Not started | Follows Hero completion.                                                                                                                                       |
| About      | Not started | Accent-theme exploded-view core follows Work.                                                                                                                  |
| Contact    | Not started | Final primary section.                                                                                                                                         |

## Current Focus

Build Task 4's sole GSAP-fed scroll-progress bridge. The static astronaut and billboard use the same theme-aware two-tone shader and are framed as one grounded composition, ready to consume that single ref without React frame updates.
