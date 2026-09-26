# UIRef landing direction contract

## Authority and purpose

Approved visual reference: `selected-uiref.png` in this directory. Product name: **UIRef**. Tagline: **Your visual memory for building better interfaces.**

The landing at `/` introduces a personal visual reference library for designers and developers building with Codex and Cursor. The primary action opens `/library`. This is an extension of the existing neutral archive system, not a replacement of the library direction in `../review/selected-direction.png`.

## Composition

Use a thin-divided header with the UIRef wordmark, a How it works anchor and an Open library link. Pair left-aligned introductory copy and one primary action with a right-hand arrangement of four cycling reference screenshots. A small note demonstrates what someone noticed about the reference. Keep the composition image-led, with dark ink, paper surfaces and restrained rust indicators inherited from the shared tokens.

Below the hero, pair concise reference-library copy with four labeled sample thumbnails. End with a small, divided footer and a direct library link. Do not add feature cards, statistics, testimonials or an AI capability claim. Samples are generated fictional interfaces, not saved customer sites.

## Responsive behavior

The hero starts with a 40/60 split, adjusts at 1100px and stacks below 800px. At mobile width, copy precedes the demonstration; the reference gallery becomes two columns below 480px. Container gutters reduce from 64px to 24px. The note and screenshot stack scale independently so neither obscures the main action. The library retains its own established responsive shell.

## Interaction and motion

The Collect / Notice / Reuse sequence explains saving, observing and returning to references. It is a presentation of the workflow; it does not run analysis or generate prompts.

The user requested continuous playback on 2026-09-24. Designs cycle automatically every 4.2 seconds and wrap after all four references. Pause/Resume explicitly controls playback. Manual steps and rear-image selection reset the interval without disabling playback. Offscreen, hidden-page, open-preview and keyboard-focus states temporarily suspend progression; playback resumes when those conditions clear. Reduced motion disables autoplay.

Four screenshot positions transition with transform over 800ms and opacity over 600ms; the hidden rear position allows designs to cycle without jumping across the foreground. Stacking order switches halfway through the transition. Notes use brief opacity and vertical transitions; active steps use a rust underline. Fine-pointer hover may reveal preview text or gently enlarge thumbnails. The central screenshot opens a labeled preview dialog; a rear screenshot brings that reference forward. Gallery thumbnails open the same preview treatment.

All controls are native links or buttons with visible keyboard focus. Shared keyboard mode removes transition and animation delays; keyboard focus inside the demonstration temporarily pauses its timer. Mouse movement restores pointer feedback without requiring a click. Reduced motion disables autoplay and animated transitions, removes the playback control and leaves all manual steps and previews available. Automatic note changes avoid live announcements; manually selected notes can announce politely.

## Implementation and scope

- `components/landing.tsx`: content, reference preview and demonstration state.
- `components/landing.tsx`: colocated Tailwind utilities for composition, typography, responsive layouts and motion states. The separate landing stylesheet has been removed.
- `app/globals.css`: shared neutral tokens, focus and motion behavior.
- `app/layout.tsx`: local Manrope font and UIRef metadata.

Stages 1–2 remain the product boundary. AI analysis, project mixing, prompt generation and comparison are later work. This contract documents source behavior; it is not a test or visual-QA completion record.
