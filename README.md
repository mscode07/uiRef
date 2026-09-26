# UIRef

Your visual memory for building better interfaces.

Personal visual reference library. Next.js App Router + TypeScript + Tailwind + customized shadcn primitives.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000 for the landing page, or http://127.0.0.1:3000/library for the reference library. Build with `npm run build`; validate types with `npm run typecheck`.

## Data

Without configuration, references are saved to `.data/references.json` and images to `.data/uploads/`. These files are ignored by Git. To use MongoDB, copy `.env.example` to `.env.local` and set `MONGODB_URI`; the database defaults to `designforme`. Existing local records are not migrated automatically.

Eight generated fictional sample references demonstrate the grid. Use **My references** to see only your own saved content.

## Current scope

The landing page and reference library support automatic website screenshots, uploaded screenshots, measured design breakdowns, optional vision analysis, and portable build prompts. Project mixing and visual comparison remain later phases; no AI provider is silently simulated. This unauthenticated personal tool binds to localhost; do not expose it publicly without adding authentication.

The local Manrope variable font is bundled through `@fontsource-variable/manrope`; rendering does not require a Google Fonts request. The landing demonstration loops automatically, supports pause/resume and manual steps, and disables autoplay under reduced motion. Shared keyboard interaction keeps transitions immediate.

See `docs/landing/surface.md`, `PRODUCT.md`, `docs/architecture.md`, `DESIGN.md`, `docs/review/critique.md`, and `design-qa.md` for implementation and review details.

## Verification

`npm test` runs input/analysis schema, prompt completeness, and capture network boundary tests (Node 22.18+ or Node 24). The production build uses Next.js's webpack compiler because the local environment prevented Turbopack's build worker from binding its internal port. The dev preview still uses Turbopack.

## Editing the interface

UI styles use Tailwind CSS v4 and live beside their JSX:

- `components/landing.tsx`: hero typography, carousel, navigation and reference gallery.
- `components/library.tsx`: library layout, filters, thumbnails and add-reference form.
- `components/ui/dialog.tsx`, `button.tsx`, `tooltip.tsx`: shared primitives.
- `app/globals.css`: Tailwind import, shared colors/radii/easing, document defaults, keyframes and accessibility policies. No page or component layout rules live here.

For example, edit the hero heading's `text-[clamp(40px,4.15vw,60px)]` to change only its size, a control's `rounded-md` to change its corner treatment, or a layout's `gap-6` to change its spacing. Responsive styles appear in the same `className`, such as `max-[481px]:text-[38px]`. Longer lists use `cn()` to group related utility strings; all classes remain explicit for Tailwind's scanner.

Use `text-brand` for rust emphasis, `text-muted-foreground` for supporting copy, `bg-surface` for secondary surfaces, and `rounded-md` / `rounded-lg` for 8px / 12px corners. The spacing unit is explicitly 4px so utility sizes preserve the existing design with the 14px root font size. Named classes like `reference-grid` are state/testing hooks, not external CSS rules.

## Website capture and design analysis

When you save a reference, UIRef saves the record first and then processes it. Existing URL bookmarks are captured the first time you open them. **Refresh capture** updates a captured website; **Analyze again** retries analysis without replacing an uploaded screenshot. Closing the detail panel does not cancel an in-flight request. Refresh the library after a page reload to see saved progress.

- Website previews use a fresh, isolated headless browser at 1440px width, capturing up to the first 4000px. Computed CSS supplies font sizes, spacing, layouts, and control styles. Websites that block automation or require sign-in may require a manually uploaded screenshot.
- On macOS, the installed Google Chrome is used. Elsewhere run `npx playwright install chromium`; on Linux install Playwright's browser system dependencies too. `UIREF_BROWSER_PATH` can point to an installed Chromium executable. Capture needs a Node host that can launch a browser; it is not an Edge runtime feature.
- Screenshot uploads are validated as decodable PNG/JPEG/WebP, at most 10MB and 40 megapixels. Original uploads are kept locally. Without a vision key, the app reports only image dimensions and sampled colors for uploads; it does not pretend to understand their layout.
- For full visual interpretation, copy `.env.example` to `.env.local` (merge with an existing file rather than overwriting it), set `OPENAI_API_KEY`, optionally set `OPENAI_MODEL`, and restart the dev server. Then choose **Analyze again**. Never put the key in client code or a `NEXT_PUBLIC_` variable. API usage is billed by your provider.
- When configured, analysis sends a resized screenshot plus reference notes and measured page evidence to OpenAI's Responses API with `store: false`. The result is schema-validated before storage. No browser cookies or login session are used for capture. [Official image input documentation](https://developers.openai.com/api/docs/guides/images-vision) and [structured output documentation](https://developers.openai.com/api/docs/guides/structured-outputs).
- **Copy build prompt** includes the evidence, colors, all design sections, personal notes, implementation recommendations, and limitations. Attach the full image in the receiving AI for higher visual fidelity. Measured drafts and AI interpretations are explicitly labeled.

Capture rejects private/reserved IP addresses, credentials, non-HTTP protocols and custom ports. DNS is validated and the connection pinned for each request, redirect and subresource. Service workers, WebSockets, downloads, non-GET requests and media streams are blocked. Time, request and response-size limits bound capture work. The processing endpoint deduplicates jobs per reference within the local server process; a distributed/public deployment needs authentication, durable jobs and shared rate limiting.
