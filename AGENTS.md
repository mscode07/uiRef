<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Design Constitution

This file defines the permanent design behavior for this project.

These rules apply to EVERY UI task unless a later project-specific
design specification explicitly overrides them.

The goal is not merely to produce functional UI.

The goal is to produce intentional, coherent, production-quality
interfaces that do not look generically AI-generated.


# 1. DESIGN DECISION PRIORITY

When making a visual decision, use this priority:

1. User-provided reference screenshots
2. Project-specific design specification
3. Existing design system and existing application patterns
4. Product Design / design tooling
5. Established UI/UX principles
6. shadcn / 21st.dev inspiration
7. Agent's own design judgment

Never override an explicit reference with a generic "best practice"
unless there is a usability or accessibility problem.


# 2. NEVER DESIGN FROM VAGUE AI DEFAULTS

Never interpret:

"modern"
"clean"
"beautiful"
"premium"
"professional"

as permission to generate generic SaaS UI.

Translate those words into concrete visual decisions.

Before implementing a page, determine:

- visual hierarchy
- information hierarchy
- layout
- spacing rhythm
- typography hierarchy
- surface hierarchy
- interaction hierarchy
- responsive behavior

Do not start by creating cards.


# 3. ANTI AI-SLOP

Actively avoid common AI-generated design patterns.

Do not automatically use:

- purple/blue gradients
- gradient text
- glowing backgrounds
- glassmorphism
- huge hero text
- excessive border radius
- cards for every piece of content
- nested cards
- unnecessary pills
- excessive badges
- excessive shadows
- excessive whitespace
- decorative blobs
- generic illustrations
- sparkle icons
- icon-in-colored-square feature lists
- unnecessary dashboard statistics
- fake testimonials
- fake activity
- generic placeholder charts
- excessive centered text

If removing a container does not hurt comprehension, consider removing it.


# 4. VISUAL HIERARCHY BEFORE CONTAINERS

Prefer establishing hierarchy using:

1. Typography
2. Spacing
3. Alignment
4. Proximity
5. Contrast
6. Borders
7. Background variation

Only then use cards/shadows/elevation.

Do not solve every hierarchy problem with another rectangle.


# 5. SPACING SYSTEM

Never use arbitrary spacing values throughout the interface.

Establish a spacing scale and reuse it.

Default starting scale when no project scale exists:

4px
8px
12px
16px
24px
32px
48px
64px
96px

Spacing must communicate relationships.

Elements belonging together → smaller gap.

Different conceptual sections → larger gap.

Maintain consistent vertical rhythm.


# 6. TYPOGRAPHY

Typography should create most of the interface hierarchy.

Avoid using too many:
- font sizes
- font weights
- text colors

Prefer approximately:

3-5 meaningful text sizes
2-3 useful font weights
3 text contrast levels

Never make everything bold.

Never make headings unnecessarily enormous.

Body text must remain readable.

Numeric/data-heavy interfaces should consider tabular numerals.


# 7. COLOR

Use color intentionally.

Every color should have a role.

Define semantic tokens such as:

background
surface
surface-elevated
text-primary
text-secondary
text-tertiary
border
accent
success
warning
danger

Do not introduce random colors directly inside components.

Do not use accent color simply to make an interface "interesting."


# 8. COMPONENT CONSISTENCY

The same component should look and behave consistently everywhere.

Buttons must share:
- radius
- typography
- height system
- interaction behavior

Inputs must share:
- height
- padding
- focus state
- border treatment

Cards must share an understandable surface hierarchy.

Do not create five slightly different versions of the same component.


# 9. BORDER RADIUS

Use a deliberate radius scale.

Do not default everything to 16px.

Example:

small controls → 4-6px
buttons/inputs → 6-8px
cards → 8-12px
large surfaces → project dependent

Pills should only be used when their shape has a purpose:
tags, filters, statuses, segmented controls, etc.


# 10. ICONOGRAPHY

Icons must communicate something.

Never add icons merely because an empty space exists.

Use one icon family consistently.

Prefer Lucide unless the project specifies otherwise.

Icon sizes should be systematic.

Avoid icons inside decorative colored squares unless the design
language explicitly calls for them.


# 11. MOTION

Animation must communicate:

state
relationship
hierarchy
feedback

Good:
- hover feedback
- dialog transitions
- tab transitions
- loading state
- drag/drop feedback
- successful copy/save feedback

Bad:
- constant floating
- decorative bouncing
- unnecessary parallax
- animation simply because a library supports it

Respect prefers-reduced-motion.


# 12. RESPONSIVE DESIGN

Never treat mobile as "desktop but narrower."

At minimum review:

1440px
1024px
768px
390px

For each breakpoint consider:

navigation
information priority
column count
spacing
touch targets
typography
tables
dialogs
overflow

If the application is mobile-first, start at mobile and progressively
enhance.


# 13. INTERACTION STATES

Every interactive component must consider:

default
hover
active
focus
disabled
loading
error
success

Never ship an interaction that only looks correct in its default state.


# 14. EMPTY / LOADING / ERROR STATES

These are part of the product design.

Never leave them as an afterthought.

Avoid generic giant illustrations.

Prefer useful, contextual states.

Loading should preserve layout where possible through skeletons.

Do not fake progress percentages unless real progress is known.


# 15. ACCESSIBILITY

Always maintain:

semantic HTML
keyboard navigation
visible focus
sufficient contrast
proper labels
accessible dialogs
reasonable touch targets
reduced motion support

Aesthetic decisions must not break usability.


# 16. CONTENT IS PART OF DESIGN

Do not fill production UI with generic AI copy.

Avoid:

"Unlock the power of..."
"Transform your workflow..."
"Supercharge your..."
"Welcome to the future of..."

Product copy should be concise and functional.

Buttons should describe actions.

Prefer:

Save reference
Analyze design
Copy prompt
Compare UI

instead of:

Continue
Submit
Get Started


# 17. SHADCN RULE

shadcn is an implementation foundation, not the design language.

Never leave major interfaces looking like default shadcn.

Customize:

spacing
radius
typography
colors
states
component composition

Do not automatically wrap everything in <Card>.


# 18. REFERENCE RULE

When screenshots/design references are supplied:

Do NOT blindly clone them.

Analyze:

layout
spacing
typography
color relationships
density
component treatment
visual hierarchy
interaction patterns

Extract the principles.

Preserve those principles while adapting them to the current product.

Never copy:
- logos
- proprietary illustrations
- branding
- text
- copyrighted assets


# 19. DESIGN TOOL USAGE

When Product Design tooling is available, use it for meaningful design
decisions and critique.

When Impeccable is available, use it during refinement.

Use shadcn and 21st.dev as component/reference resources when useful.

Do not use tools simply because they exist.


# 20. VISUAL QA

A page is NOT finished because:
- TypeScript compiles
- tests pass
- components render

After implementing an important UI:

1. Run the application.
2. Inspect the actual rendered page.
3. Review desktop.
4. Review mobile.
5. Check hierarchy.
6. Check spacing.
7. Check typography.
8. Check alignment.
9. Check interaction states.
10. Check responsiveness.
11. Look specifically for AI-slop patterns.
12. Use design critique tooling when available.
13. Fix visual problems.
14. Inspect again.

Never claim the UI is finished without visually reviewing it.


# 21. SELF-CRITIQUE

Before finishing any significant UI task, ask:

- What is the first thing the eye notices?
- Is that what SHOULD be noticed first?
- Is anything competing unnecessarily?
- Are there too many containers?
- Are there too many colors?
- Are there too many radii?
- Are spacing relationships clear?
- Does anything look like default shadcn?
- Does anything look generically AI-generated?
- Can anything be removed?
- Does the interface still work at mobile width?
- Does this follow the supplied references?

Fix obvious problems before returning the work.


# 22. PRESERVE GOOD EXISTING DESIGN

When modifying an existing application:

Do not unnecessarily redesign unrelated areas.

Reuse established:
- tokens
- components
- patterns
- spacing
- typography

Improve consistency rather than introducing another visual language.


# 23. WHEN UNCERTAIN

Do NOT compensate for uncertainty by adding decoration.

Choose the simpler solution.

Prefer:
fewer colors
fewer containers
fewer font sizes
fewer effects
clearer hierarchy

Restraint is preferable to decoration.


# 24. FINAL STANDARD

Every interface should feel like someone made deliberate decisions.

The goal is NOT:

"Looks impressive for AI-generated UI."

The goal is:

"Looks like a competent product designer and frontend engineer worked
together on it."
