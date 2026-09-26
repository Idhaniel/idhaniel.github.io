# Working rules for this repo

This is Daniel Uwandu's portfolio. Read `DESIGN.md` before any UI change and follow it exactly: tokens, type, motion rules, and the "will not do" list.

## Stack and commands
- Astro 5 with React islands. Package manager: npm.
- Dev server: `npm run dev`
- Production build: `npm run build`
- Preview the build: `npm run preview`
- Before calling a task done, run the build and fix every error and warning.

## How to work
- Build one section at a time in the order of DESIGN.md §5. Stop after each section so Daniel can review it at localhost.
- Put design tokens in `src/styles/tokens.css`. Components use tokens only, never raw hex values.
- Every animated component must have a `prefers-reduced-motion` path.
- Don't add dependencies beyond those named in DESIGN.md §7 without asking.
- Commit after each finished section with a plain message ("Add ledger chapter").
- Never push or deploy without being asked.
