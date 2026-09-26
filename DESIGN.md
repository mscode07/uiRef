---
name: UIRef
description: Your visual memory for building better interfaces.
colors:
  background: "#fafaf9"
  foreground: "#20211f"
  surface: "#f0f0ed"
  muted: "#60635e"
  border: "#dedfda"
  accent: "#a34028"
  destructive: "#a33227"
typography:
  body:
    fontFamily: "Manrope Variable, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "24px"
  xl: "32px"
  section: "48px"
  wide: "64px"
---

# UIRef design system

## Overview

UIRef is an image-led personal archive with restrained neutral chrome. Typography, alignment and thin dividers establish hierarchy; reference screenshots carry visual variety. The landing page extends this existing system rather than introducing a separate brand palette.

Visual authority for the library remains the user's selected second mock, `docs/review/selected-direction.png`. The approved landing reference is `docs/landing/selected-uiref.png`; its composition and interaction contract live in `docs/landing/surface.md`.

## Colors

Paper background, soft neutral secondary surfaces and dark ink keep screenshots prominent. Muted text supports metadata; borders separate regions. Rust is reserved for focus, selection indicators and meaningful link emphasis. Preserve the shared CSS tokens in `app/globals.css`; do not sample screenshot colors into the application chrome.

## Typography

Manrope Variable is bundled locally through `@fontsource-variable/manrope` and imported by the root layout, with system sans fallbacks. The body uses the frontmatter scale. The Library and dialogs use locally bundled Geist Variable for clearer reading at small sizes. Library headings are compact (30px), metadata uses 12px, and reference titles use 13–14px. Weight, proximity and restrained negative heading tracking create hierarchy.

The landing uses a responsive display heading (38–60px, weight 550, line-height 1.08 desktop / 1.14 mobile) to state the tagline. This display treatment belongs to the introductory surface, not daily library controls.

## Layout

Reuse the spacing scale above. The library has a 196px desktop sidebar and a four-column screenshot grid with 18px horizontal and 24px vertical gaps. It reduces to three columns at laptop, two at tablet and one on small mobile. Mobile filters use a labeled dialog rather than squeezing a sidebar alongside content.

The landing owns a centered container with a 1600px maximum width and responsive gutters (64, 40, 32 and 24px). Its two-column hero stacks below 800px. Landing-specific proportions and gallery behavior are recorded in the surface brief.

## Elevation & Depth

Library thumbnails remain flat at rest, without enclosing cards. Fine-pointer hover adds the shared soft float shadow. Dialogs use structural elevation above a dimmed overlay. Only the landing's overlapping reference demonstration uses a low shadow to communicate screenshot order; do not spread this treatment to the archive grid.

## Shapes

Use 12px reference-image and dialog corners, 8px control corners and 6px small corners. Borders and alignment do most of the grouping. Avoid unnecessary pills, nested containers and decorative colored icon tiles.

## Components

Buttons share immediate press feedback, consistent typography and visible focus. Primary actions use dark ink surfaces with light text. Inputs remain neutral with visible boundaries. Active library navigation uses a thin line and stronger text. Lucide icons clarify actions; navigation remains primarily text.

Reference images are interactive buttons with keyboard-visible preview cues. Dialogs provide a title, description, close control and focus handling. Preserve labeled controls, semantic links for navigation, skip links and accessible mobile filters.

Shared pointer feedback uses short color and transform transitions. Screenshot hover zoom is limited to fine pointers that support hover. Dialog entry takes 220ms, exit 160ms; overlays fade. The command dialog remains immediate. Any keydown switches to keyboard mode and disables transitions and animations until pointer movement or a press resumes.

Reduced-motion preferences disable animation and transitions, including hover/press transforms covered by the shared overrides. The landing demonstration disables autoplay for reduced motion and keeps manual steps available. Reduced transparency uses opaque overlays. The landing's looping design carousel is explicitly user-requested and specified in its surface brief. Daily library content remains stationary except for brief interaction feedback.

## Do's and Don'ts

- Do preserve the neutral library palette and image-led hierarchy.
- Do use typography, spacing and dividers before adding containers.
- Do keep frequent keyboard workflows immediate and focus visible.
- Do label generated examples as sample references.
- Don't add gradients, sparkles, avatars, fake activity, statistics or testimonial decoration.
- Don't promote the landing's overlapping screenshot composition into a global card pattern.
- Don't present future analysis or project-mixing features as completed functionality.

## Styling implementation

Component styles are colocated Tailwind v4 utilities in the JSX. `app/globals.css` contains only Tailwind theme setup, document defaults, shared animation keyframes and global accessibility policies. The former `app/landing.css` has been removed. Utility spacing is based on 4px independently of the 14px root typography. Keep complete utility strings visible to Tailwind; conditional states use `cn`, data/ARIA variants and group variants. Extend shared tokens for product-wide changes; edit a component's own utilities for local changes.

## Brand and pointer refinement

The UIRef wordmark now pairs with a rust stacked-reference/bookmark mark, shared across the landing page, desktop sidebar, mobile header and favicon. The reference rust is `#a34028`, used on the mark, “visual memory” in the hero, active navigation/filter labels and source links. Body copy stays neutral.

Desktop fine pointers use an outlined native arrow asset with a soft cool shadow. It has no JavaScript tracking lag; editable text retains its text cursor and disabled controls retain their native state cursor. Touch interfaces keep native behavior. Shared Tailwind `shadow-float` and `shadow-dialog` tokens provide offset, layered elevation for the landing reference stack, hovering library previews and dialogs. Library navigation uses brief color/press transitions; keyboard and reduced-motion overrides still apply.
