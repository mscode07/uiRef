# Reference capture and analysis QA

Verified in the running application through Computer Use:

- Opened the existing Zernio bookmark and exercised capture, retry, and refresh. Saved a real 1440 × 4000 image locally; both the library thumbnail and detail image render it.
- Inspected measured typography, component metrics, layout, content hierarchy and semantic color samples. Values are extracted from the browser rather than synthesized as AI claims.
- Build prompt contains 5,366 characters for the current Zernio capture. Verified typography, layout, colors, instructions and limits are included. The copy action shows “Prompt copied”; the browser tool's separate clipboard reader returned empty, so the system clipboard contents were not independently asserted.
- Uploaded a local PNG through the actual Add reference form. Verified its 1448 × 1086 preview, image palette, personal note and 2,356-character draft prompt. The draft explicitly says layout/typography have not been interpreted without vision. Temporary QA reference removed afterward; original Zernio preserved.
- Reviewed rendered detail views at 1440, 1024, 768 and 390px. The image and details scroll independently. Mobile keeps action buttons visible. No horizontal dialog overflow. The first mobile inspection exposed a buried footer; fixed and inspected again.
- Capture failure and missing-provider states are visible and recoverable. Prior saved content survives failures. No live vision API call was possible: no OPENAI_API_KEY is configured. The integration is implemented but live-provider output remains unverified.

Validation: production webpack build passed, TypeScript passed, all 10 tests passed. Tests cover complete prompt composition, honest unprocessed/image-only output, malformed AI payloads, and private/reserved network targets. The Impeccable detector was run; it reported typography-ramp advisories against the pre-existing design metadata. Refinement preserves the established Manrope, neutral surfaces, and control sizing. The detail view uses sections/dividers instead of nested cards.

For provider setup and runtime limits, see README.md.
