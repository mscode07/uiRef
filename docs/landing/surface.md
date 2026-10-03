# UIRef landing direction contract

## Authority and purpose

Approved visual reference: `selected-uiref.png` in this directory. Product name: **UIRef**. Tagline: **Your visual memory for building better interfaces.**

The landing at `/` introduces a personal visual reference library for designers and developers building with Codex and Cursor. The primary action opens `/library`. This is an extension of the existing neutral archive system, not a replacement of the library direction in `../review/selected-direction.png`.

## Composition

Use the shared floating header with a separate UIRef brand badge and capsule navigation containing section links and a dark Open library action. Pair left-aligned introductory copy and one primary action with a right-hand arrangement of four cycling reference screenshots. A small note demonstrates what someone noticed about the reference. Keep the composition image-led, with dark ink, paper surfaces and restrained rust indicators inherited from the shared tokens.

Below the hero, place the interactive How it works demonstration before the reference section. Then pair a centered reference-library introduction with the screenshot-led 3D coverflow described below. End with the reference-led footer: a library action beside stacked screenshots, followed by brand and navigation columns and a divided copyright row. Do not add feature cards, statistics, testimonials or an AI capability claim. Gallery samples are generated fictional interfaces, not saved customer sites.

## Responsive behavior

The hero starts with a 40/60 split, adjusts at 1100px and stacks below 800px. At mobile width, copy precedes the demonstration. Container gutters reduce from 64px to 24px. The note and screenshot stack scale independently so neither obscures the main action. The reference coverflow retains its central image and clipped neighboring slides at mobile widths, with responsive image sizing and wrapping controls. The library retains its own established responsive shell.

## Interaction and motion

The hero's Collect / Notice / Reuse sequence explains saving, observing and returning to references. That hero presentation does not run analysis or generate prompts; the separate How it works demonstration below provides the temporary preview workflow.

The user requested continuous playback on 2026-09-24. Designs cycle automatically every 4.2 seconds and wrap after all four references. Pause/Resume explicitly controls playback. Manual steps and rear-image selection reset the interval without disabling playback. Offscreen, hidden-page, open-preview and keyboard-focus states temporarily suspend progression; playback resumes when those conditions clear. Reduced motion disables autoplay.

Four screenshot positions transition with transform over 800ms and opacity over 600ms; the hidden rear position allows designs to cycle without jumping across the foreground. Stacking order switches halfway through the transition. Notes use brief opacity and vertical transitions; active steps use a rust underline. Fine-pointer hover may reveal preview text or gently enlarge thumbnails. The central screenshot opens a labeled preview dialog; a rear screenshot brings that reference forward. The reference coverflow uses the same preview dialog.

All controls are native links or buttons with visible keyboard focus. Shared keyboard mode removes transition and animation delays; keyboard focus inside the demonstration temporarily pauses its timer. Mouse movement restores pointer feedback without requiring a click. Reduced motion disables autoplay and animated transitions, removes the playback control and leaves all manual steps and previews available. Automatic note changes avoid live announcements; manually selected notes can announce politely.

## How it works extension

The user-specified perspective frame introduces the Try a reference / Find the details / Build with it sequence before the reference gallery. Its scroll reveal settles from a tilted, slightly smaller frame into a flat, full-size workspace. This treatment is local to the demonstration. Preserve the shared neutral surfaces, ink text, rust accent, typography, borders and focus tokens; it does not establish a new global visual system.

The default example is a captured SuperX page: `public/demo/superx.webp` supplies the screenshot and `lib/demo-example.json` supplies its URL, measured insights and build prompt. It is an attributed real-site example, distinct from the fictional gallery samples. A persistent, labeled URL input stays available across all three steps. The screenshot and input occupy the left column at desktop width; step content occupies the right. Below the medium breakpoint they stack, with the input and screenshot first.

Submitting a public website URL calls `POST /api/demo/preview`. The route uses `captureWebsiteInMemory`, derives browser-measured insights and image evidence, and returns an inline WebP image with a prompt produced by `buildReferencePrompt`. Temporary previews never save a database record or upload an image to storage. No AI call runs in this demo. The saved library already supports optional AI analysis; the demo describes its own results as measurements rather than AI interpretation.

Keep the existing preview visible during capture, with a loading overlay and disabled submission button. Report invalid URLs, busy capture capacity and unavailable sites inline. A successful capture advances to the measured details. The final step exposes the full read-only prompt, clipboard feedback and a manual-copy fallback, followed by a library link for keeping references.

Steps autoplay every 6.5 seconds and wrap. Step buttons and Next provide manual progression and reset the interval; Pause/Resume controls playback. Input or textarea focus, keyboard focus within the section, loading, offscreen position and a hidden page temporarily suspend progression. Copying the prompt pauses playback until resumed. Reduced motion leaves manual navigation available and removes autoplay and animated transitions, including the perspective reveal.

All three content panels overlap in one grid cell so the tallest panel reserves the required height during automatic progression. Inactive panels remain hidden and inert. Automatic changes suppress live announcements; manual exploration can announce politely. Keep native controls, visible focus and the shared keyboard-motion behavior.

## Reference coverflow extension

The user's Skiper49 screenshot supplies the direction for this section: a centered introduction, a prominent front-facing reference, and smaller neighboring screenshots angled inward in perspective. The registry source required authentication, so `components/ui/reference-carousel.tsx` implements the supplied visual direction with the existing Framer Motion dependency. It is a custom implementation, not an imported registry component. Preserve the shared tokens and the existing hero and How it works treatments.

Use the eight existing sample images in `public/references`: Atelier, Forma, Nova, Roam, Daylight, Stackkit, Array and Lana Park. Keep images in a clipped stage with responsive widths, the selected design's name and category centered below, and restrained controls underneath. Side screenshots move to the center when selected; selecting the central screenshot or its name opens the existing reference preview dialog.

The carousel advances every 4.2 seconds and wraps through all eight designs. Previous/Next, eight selection dots, horizontal swipes and Left/Right arrow keys provide manual navigation and reset the interval. Pause/Resume explicitly controls playback. Offscreen, hidden-page, open-dialog and keyboard-focus states suspend autoplay; touching the stage also holds progression until the gesture ends. Reduced motion disables autoplay and transition duration and omits the playback button while retaining manual controls and previews.

Transforms and opacity settle over 800ms. Only the selected screenshot enters the tab order; manual navigation remains available through labeled controls. Automatic label updates avoid live announcements, while manual changes can announce politely. Use the established native buttons and visible focus treatment.

## Footer extension

The user's pinned screenshot establishes the composition: a call to action at upper left, stacked images at upper right, brand and link columns below, and a lower copyright row. Adapt that structure to UIRef's existing product and shared tokens. Use the established ink, paper, rust accent, typography, borders and controls; the footer does not introduce a new visual system.

The primary action opens `/library`; the secondary Try a reference first link targets `#how-it-works`. The screenshot stack reuses Atelier, Forma and Roam, with Roam in front. The whole stack is one labeled button that opens the existing travel editorial preview. Its small fine-pointer hover lift respects reduced motion.

Below, pair the UIRef brand and tagline with the real @mscode X link and Explore UIRef links to About, Contact, the library, How it works and references. The A little inspiration column opens existing Atelier, Nova and Roam previews through sample-category buttons. Keep these actions connected to real destinations and the shared preview dialog. Do not add newsletter, social or legal placeholders for features or pages that do not exist. The final divided row contains the copyright copy and a Back to top link to `#main`.

On mobile, the action block precedes the image stack; the brand spans the full row above two navigation columns. At the medium breakpoint, the action and stack sit side by side, and brand and navigation form three columns. Allow actions and the copyright row to wrap. Preserve labeled native controls, visible keyboard focus and comfortable touch targets.

## Shared header and missing-page extension

The user's pinned tasteskill.dev reference establishes the header composition: a separate floating brand badge and capsule navigation with a dark primary action. `SiteHeader` adapts that structure to UIRef using the existing surface, shadow, radius, typography and focus tokens. It stays sticky on desktop and mobile. How it works and References point to `/#how-it-works` and `/#references`, so they also work from the missing-page route. Landing section scroll offsets of 112px leave room for the header.

The desktop navigation includes How it works, References, About and Contact. Below 1024px, keep Open library visible and move these links into a disclosure menu. The labeled toggle exposes its expanded state and controlled menu. Selecting a link, clicking outside, leaving the menu by keyboard or returning to desktop width closes it; Escape closes it and restores focus to the toggle. Preserve native links, visible focus and comfortable touch targets.

`app/not-found.tsx` supplies the actual missing-route page. Reuse the shared header and theme around a centered missing-reference composition: a dashed frame with 404 and a bookmark icon, flanked by the existing Atelier and Forma screenshots. Treat the screenshot composition as decorative and keep the page heading and recovery copy accessible. Provide a primary library link and a secondary Back to home link, a skip-to-content link, and a simple divided footer. The composition scales and clips its side images at mobile widths while recovery actions can wrap. This extension changes no global design tokens.

## About and Contact extension

The `/about` and `/contact` routes reuse `InfoLayout`: the shared sticky header and gutters, a skip-to-content link, and a compact footer with the brand, About, Contact and the user's real X profile at `https://x.com/mscode07`. The landing footer also exposes About, Contact and X. Both pages inherit the existing light theme and introduce no new global design tokens.

About explains the existing workflow: collect websites or screenshots with notes, inspect measured design details, use optional AI interpretation when a provider is configured, and copy a reference-based build prompt. Its introduction gives the reference imagery the right 55% column, removing the earlier narrow image cap to reduce empty space. `components/about-reference-stack.tsx` cycles the existing Atelier, Forma and Roam screenshots with matching design observations, backed by real Nova and Forma screenshot layers. Images crossfade every five seconds over 650ms with a subtle 10px vertical offset and 0.985 scale. Pause/Resume and selection dots provide control; offscreen, hidden-tab and keyboard-focus states pause autoplay. Reduced motion leaves manual selection with immediate changes and no animated transforms. Overlapping note panels reserve the tallest note's height. The introduction stacks below 1024px; retain the divided workflow and maker sections, established responsive typography and unchanged global tokens.

Between the About introduction and purpose section, `components/ui/stack-spread.tsx` adapts the user-supplied Hyperiux Vault Stack Spread using the existing Framer Motion dependency. Eight existing UIRef sample screenshots replace the source's unrelated photos. Across a 220svh scroll region, a tilted central stack fans into scattered upper and lower rows on desktop and paired columns below 768px, revealing a clear central message about developing a personal point of view. The stage stays sticky 96px below the viewport top to accommodate the shared header. Reduced motion replaces this sequence with a static two-column gallery, expanding to four columns at the medium breakpoint, without the extra scroll region. Preserve the rest of About and the existing global tokens; this adaptation adds no dependency or new global design tokens.

Contact retains the reference's composition while matching the app's light theme: a centered title and introduction above direct contact channels and a wireframe globe on the left, with a bordered message form on the right. Typography matches About: a 38px/52px semibold title with 1.12 line height and -0.035em tracking, and 26px semibold section headings with -0.03em tracking. The composition has a 1152px maximum width and a 0.9fr/1.1fr split from 1024px; below that width, contact details and the globe precede the form. The name and optional company fields share a row from 640px and stack below it.

Contact inherits the shared paper background, ink text, muted surface, borders, and rust accent directly from global tokens, without page-level color overrides. Preserve `DESIGN.md`, its sidecar and global tokens. Keep existing Manrope typography, spacing, native controls and visible focus, with shared input/button radii.

`components/contact-experience.tsx` supplies the channels, globe and form composition. The content enters once with a 16px vertical settle over 650ms using `[0.22, 1, 0.36, 1]` easing. The decorative, accessibility-hidden globe responds to mouse position with up to 8 degrees of horizontal rotation through a spring (stiffness 70, damping 24), returning to rest on pointer exit. It does not rotate continuously. Reduced motion removes the entrance duration and displacement and keeps the globe stationary.

Contact provides the user's email, `msabhithakur7777@gmail.com`, and real X profile, `@mscode07`, alongside name, optional company, email and message fields. The email-draft behavior remains unchanged: submission validates required fields and email format, rejects a blank name and messages shorter than five trimmed characters, and opens a `mailto:` draft with an encoded subject and body. A supplied company is included in the draft body. It does not deliver or store messages. Keep this behavior explicit beside the Open email draft action: the user reviews and sends from their email app.

Use native labels and validation, visible focus, and a status message after preparing the draft. Retain entered content and provide the direct email address as a fallback if an email app does not open. The status describes draft preparation, never successful delivery; editing clears it.

## Implementation and scope

- `components/landing.tsx`: content, reference preview and demonstration state.
- `components/landing.tsx`: colocated Tailwind utilities for composition, typography, responsive layouts and motion states. The separate landing stylesheet has been removed.
- `components/how-it-works.tsx`: temporary preview form, three-step demonstration, playback and copying.
- `components/landing-footer.tsx`: library action, screenshot stack, brand, navigation, preview callbacks and copyright row.
- `components/site-header.tsx`: shared sticky brand and capsule navigation, including the mobile disclosure menu.
- `components/info-layout.tsx`: shared informational-page shell and compact footer.
- `components/contact-form.tsx`: validated local form and email-draft handoff.
- `app/about/page.tsx`: product purpose, existing workflow, sample reference and maker links.
- `app/contact/page.tsx`: direct contact details and email-draft form.
- `app/not-found.tsx`: themed missing-route page with library and home recovery links.
- `components/ui/container-scroll-animation.tsx`: user-specified perspective frame and reduced-motion behavior.
- `components/ui/reference-carousel.tsx`: eight-image coverflow, navigation, playback and preview callbacks.
- `app/api/demo/preview/route.ts`: temporary measured preview response and build prompt.
- `lib/capture/website.ts`: shared browser capture, with a separate in-memory path for the demo.
- `app/globals.css`: shared neutral tokens, focus and motion behavior.
- `app/layout.tsx`: local Manrope font and UIRef metadata.

The landing now includes temporary measured previews and reference-based prompt generation. Optional AI analysis belongs to the saved library; project mixing and comparison remain outside this landing extension. This ordinary surface extension preserves the shared tokens and does not require changes to `DESIGN.md` or its sidecar. This contract documents source behavior; it is not a test or visual-QA completion record.
