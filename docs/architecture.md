# Foundation architecture

Next.js 16.3.6 App Router is the single application and server. TypeScript, Tailwind 4, shadcn/Radix primitives, Lucide and Zod are installed. The explicit user stack takes precedence over the Product Design Vite starter.

- `components/library.tsx`: Library client state, filters/search, modal details, quick search, add flow.
- `components/ui`: shadcn primitives, styled through product tokens; focus return is preserved.
- `lib/schemas.ts`: reference, analysis, project, design brief and comparison contracts.
- `lib/db`: MongoDB driver connection and reference repository. Set MONGODB_URI to use MongoDB; otherwise local development uses a serialized atomic JSON file in `.data`. This file fallback supports a single local Next process, not multiple workers.
- `lib/storage`: replaceable screenshot storage interface. Local implementation validates image signatures and stores UUID filenames outside public.
- `lib/ai/provider.ts`: provider interface with Zod validation for analysis, coherent design brief generation and comparison. No provider is configured and no fake analysis is shown.
- `app/api`: same-origin reference read/write and screenshot upload/read. Bind only to localhost while unauthenticated.

## Scope
Implemented: responsive Library, search across metadata/notes, multi-group filters, sorting, preview density, sample/personal collections, accessible dialogs, Cmd/Ctrl K quick search, upload/bookmark creation and persistence.

Foundation-only: AI analysis, project mixer, implementation prompt generation and comparison. Navigation clearly states the phase boundary. These are not advertised as working.

## Future phases
Add a configured AI provider and analysis job states, then editable structured detail profiles. Implement project persistence/mapping and generated brief/prompt workflows. Implement comparison and fix prompts. Add authentication before any public deployment, at the Route Handler boundary. No SaaS or team abstractions are needed.

## Reference capture and analysis extension

`lib/capture/website.ts` runs isolated headless Chromium capture. `network.ts` validates public DNS targets and pins connections, including redirects and subresources. `POST /api/references/[id]/process` deduplicates active local jobs, preserves saved records across failures, stores capture progress before analysis, and supports explicit capture refresh. `lib/ai/insights.ts` supplies measured fallback evidence and validated optional vision analysis; it never presents fallback evidence as AI interpretation. `lib/reference-prompt.ts` composes the portable prompt from the same stored details rendered by `components/reference-detail.tsx`.

The earlier foundation-only description above records the original phase. Single-reference analysis/prompt generation is now implemented; project mixing and comparison are still deferred. Live vision verification requires OPENAI_API_KEY, which is not included in the repository.
