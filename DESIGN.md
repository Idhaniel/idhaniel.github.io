# Daniel Uwandu — Portfolio Design Spec

The single source of truth for the build. If code and this file disagree, this file wins until it is updated on purpose.

Mockup canvas (reference visuals): https://claude.ai/artifact/2hySDbeqhjhVuk7bEeScUs

## 1. What this site is

A portfolio for a general backend developer: whatever the product is, Daniel builds the server side. The four chapters are examples across different domains (finance, infrastructure, supply chain, e-commerce), not a specialism. Don't frame him as a fintech or Go specialist. The site proves that by letting visitors *use* small versions of the work, rather than listing it.

Audience: engineering managers, senior engineers, recruiters. They skim first, then go deep on one project. The page must reward both.

The feel: calm, dark, precise. Apple-level restraint in spacing and type, with Mercury's quiet dark surfaces and Integrated Biosciences' big type and hairline structure. Dull, not dead.

## 2. Color (60-30-10)

| Role | Name | Hex | Share |
|---|---|---|---|
| Canvas | Ink | `#141719` | 60% |
| Raised surface (panels) | Plate | `#1b1f22` | 30% (with text + rules) |
| Deep surface (terminal) | Well | `#0f1214` | part of 30% |
| Hairline rule | Rule | `#262b2e` / `#2b3034` | part of 30% |
| Control outline | Edge | `#3a4044` | part of 30% |
| Primary text | Bone | `#e4e1d9` | part of 30% |
| Secondary text | Stone | `#c7c5bf` | part of 30% |
| Muted text / labels | Ash | `#8e9296` | part of 30% |
| Accent | Brass | `#b39c6c` | 10%, strictly |

Brass is used for exactly these things:
- the one primary button per view
- "balanced" / success state text
- the active shard, focus rings, and benchmark bars
- the ledger pivot and the T-account rule on the OG image

Brass is never used for:
- headings
- large fills
- section backgrounds
- gradients

Alternates tested in the mockup: olive `#8a9577`, steel `#7b8c9a`. Brass is the pick.

Contrast floors:
- Body text 4.5:1 minimum. Ash on Ink passes; don't go darker than Ash for readable text.
- Text on brass is Ink `#141719`.

Theme: dark only for v1. Expose all colors as CSS custom properties so a light theme can be added later without touching components.

## 3. Type

- **Schibsted Grotesk**, weights 400, 500. Everything except data. Never bold above 500. (Replaced Hanken Grotesk, which read as too generic. It has no 300, so the lede uses 400 in Stone.)
- **IBM Plex Mono**, weights 400, 500. Only for real data: currency amounts, commands, terminal output, benchmark numbers. Never for labels, nav, or decoration.

| Token | Size / line-height | Weight | Tracking | Use |
|---|---|---|---|---|
| display | min(19vw, 96px) on phones, clamp(84px, 9.5vw, 136px) from 720px / 0.88 | 400 | -0.048em | Hero name only |
| h2 | clamp(30px, 3.4vw, 46px) / 1.0 | 400 | -0.035em | Chapter headlines |
| statement | clamp(24px, 2.8vw, 40px) / 1.18 | 400 | -0.022em | Story statements |
| lede | clamp(18px, 1.5vw, 21px) / 1.32 | 400 (Stone) | -0.012em | Hero statement |
| body-lg | 17px / 1.55 | 400 | 0 | Chapter body |
| body | 16px / 1.55 | 400 | 0 | Supporting copy |
| small | 14–15px / 1.45 | 400 | 0 | Meta, captions |
| data | 14–17px / 1.5 | 400 | 0 | Mono amounts and commands |

Type rules:
- Sentence case everywhere.
- No ALL-CAPS eyebrow labels.
- No single highlighted word in a headline.
- Lines under ~70 characters.
- Left-aligned text. Centering is allowed only for the ledger status line.

## 4. Shape and space

- **Radius:**
  - 999px for buttons and chips (pills)
  - 18px for panels
  - 6px for small cells
  - 3px for bars
  - nothing else
- **Shadows:** none. Elevation comes from Ink to Plate value steps and 1px rules.
- **Layout:**
  - 12-column grid, 24px gutter
  - Side padding: 24px under 720px, 48px from 720px, 96px from 1100px
  - Responsive is required: every section must work from 320px wide up, with no horizontal scroll. Multi-column layouts stack to one column under 900px.
  - Content max width 1248px
- **Section rhythm:** 160px between chapters on desktop, 96px on mobile. Keep it generous.
- **Touch targets:** 44px minimum.

## 5. Page structure (scroll story)

1. **Hero.** Small wordmark and nav (Work, About, Download CV, brass "Email me" pill). On phones the nav drops to its own row under the wordmark. The giant two-line name. Hairline rule. Then the lede on the left and a short definition list on the right (Now / Studied / Available / Elsewhere). Daniel's photo sits to the right of the name (under the nav on phones), 18px radius, mild grayscale. A faint network map (nodes, hairline links, the odd pulse hopping along a route) fills the background, strongest top right. No typing effect.
1b. **Story.** A pinned section with three short first-person statements, shown one at a time with an "01 / 03" counter and a hairline progress bar. Words brighten one by one as you scroll (after Integrated Biosciences). The network map sits faintly behind it. Reduced motion or no JS: the three statements stacked and fully lit.
2. **Chapter — The ledger (Today's Solution).** The signature moment.
   - Left column: "01 / 04" chip with "Selected work", headline "A wallet that always balances", one or two sentences, and stack chips. No instructions about how to use the demo; the UI should explain itself.
   - Faint ledger-paper rules sit behind the chapter.
   - Right column: a pinned panel with a balance beam, a journal, and totals.
   - Scroll behavior: as the user scrolls through a ~300vh section, each of the four example entries posts. The debit lands first, the beam tilts, and the status reads "Out by ₦X". The credit then lands and the beam settles with "Balanced."
   - Reduced motion: all four entries are shown posted, with no beam tilt.
   - Phones, tablets and short screens (under 900px wide or 640px tall): no pinning. The panel sits under the text with "Post next entry" and "Start over" buttons instead.
3. **Chapter — Cachet.**
   - Left column: story and benchmark bars (SET 77k+, GET 59k+, 50 clients).
   - Right column: a working in-browser terminal (SET/GET/DEL/EXPIRE/TTL/PING, with a real TTL countdown) and an 8-shard strip that lights the shard for the last key.
   - Suggestion chips run example commands.
4. **Chapter — Fish supply chain.**
   - A pinned horizontal scroll with five stops: farm, processor, distributor, retailer, consumer.
   - Each stop is written as a "block": the event, a short hash, and an attached IoT reading (temperature, humidity).
   - Earlier blocks visibly chain to later ones with a thin rule.
   - The final frame explains the Solidity contracts, role-based access, and the Nethereum backend.
5. **Chapter — E-commerce backend.**
   - A compact case study: a module diagram (NestJS modules as outlined boxes) and one annotated order-plus-payment transaction sequence.
   - No scroll pinning. Contrast with the chapters above is intentional.
6. **About.**
   - Two short paragraphs in first person, plus education (UNILAG, Computer Engineering, 2026, CGPA 4.52/5.00).
   - Photo at `src/assets/daniel.jpg` (4:5, metadata stripped), shown as a plain rectangle with an 18px radius and a mild grayscale.
   - Material for the paragraphs, in Daniel's words: he likes understanding systems in depth; he prefers removing dependencies to adding them ("no use your own spoil my own"); he built a queue for outgoing emails so sign-up responds straight away instead of waiting on the mail server; he sped up a slow database with the right indexes. Interests: computer networking (reads about it for fun) and anime. Keep it modest and specific.
7. **Stack.**
   - Four plain grouped lists: Languages, Backend, Data, Infrastructure and networking.
   - No logos, no percentage bars, no star ratings.
8. **Contact.**
   - A large "Email me" line (mailto: danieluwanduc@gmail.com), a "Download CV" pill (`/resume.pdf`), plus GitHub and LinkedIn.
   - Footer with location and time zone, written as a sentence ("Lagos, Nigeria. GMT+1.").

The chapter order is a sequence, so a small "Work 1 of 4" style indicator is allowed in a sticky chapter nav. Nowhere else.

## 6. Motion

Library choices:
- **Motion** (`motion` package): React islands, `useScroll`, `useTransform`
- **Lenis**: smooth scroll, lerp around 0.1
- **GSAP**: not used, to keep one mental model

Easing and timing:
- Standard ease: `cubic-bezier(.2,.8,.2,1)`
- Durations: 250ms for UI feedback, 650ms for reveals and beam, never over 900ms

What moves:
- **One page-load moment.** The hero name rises into place with a clip reveal, line by line, 80ms stagger. The nav and lede fade in after. That is the only unprompted animation.
- **Scroll-driven motion is reserved for the story, ledger and supply-chain sections.** Everything else is static until interacted with.
- **Ambient:** the network map pulses (opacity only, one link at a time). Nothing else moves on its own.
- **Interaction feedback:**
  - Buttons darken 6% on hover.
  - Links shift to brass on hover.
  - Focus rings are 2px brass with a 3px offset.

What does not move:
- No fade-up on every section.
- No parallax on text.
- No cursor followers, particles, marquees, or magnetic buttons.

Accessibility and performance:
- `prefers-reduced-motion: reduce` disables Lenis, disables pinning, and shows the final states.
- Animate only `transform` and `opacity`.
- Target 60fps on a mid-range Android phone.

## 7. Tech

- **Astro 5**, static output. React islands only for the Ledger, Terminal, and SupplyChain components.
- Tailwind is optional. If used, map every token above into `@theme` and never use arbitrary colors.
- Fonts self-hosted via `@fontsource/hanken-grotesk` and `@fontsource/ibm-plex-mono`.
- **Deployment:** GitHub Pages from the repo `Idhaniel/Idhaniel.github.io`, using the official `withastro/action` workflow. The site URL is `https://idhaniel.github.io`.
- **Performance budget:**
  - Lighthouse 95+ on all four categories
  - JS under 120 KB gzipped on the home page
  - LCP under 1.8s on 4G

## 8. SEO and link previews

- `<title>`: "Daniel Uwandu — Software developer"
- Meta description: one sentence, taken from the hero lede.
- Open Graph tags:
  - `og:title`, `og:description`, `og:type=website`, `og:url`
  - `og:image` at 1200×630, using an **absolute** URL
  - `og:image:alt`
- Twitter tags: `twitter:card=summary_large_image` plus the matching title, description, and image.
- The OG image is generated at build time from the design in the mockup (Satori via `astro-og-canvas` or a small Satori script) and saved to `public/og.png`. A static exported PNG is also fine.
- Also include: favicon (a small brass T-account mark), `robots.txt`, `sitemap.xml`, and JSON-LD `Person` schema.

After deploying, verify with opengraph.xyz and the LinkedIn Post Inspector.

## 9. Copy rules

- First person, plain verbs, specific numbers.
- Don't oversell. State what was built and what it does; let the numbers speak. No superlatives.
- Cachet is a learning project in Go, and the copy should say so. Don't present Daniel as a Go expert.
- Computer networking is an interest. It goes in the stack list, not as a headline fact.
- Banned words: passionate, leverage, cutting-edge, seamless, innovative, "I love to", journey.
- No emoji.
- Buttons say what they do ("Email me", "Post next entry", "Run").
- The ledger amounts are labelled as example entries (the journal's first column header says "Example entries"). Never imply they are real client data.
- Keep UI text short. Don't explain what buttons do or how to scroll.

## 10. Things we will not do (AI tells)

- Purple/blue gradients, glassmorphism, glowing blobs, grain overlays
- "Hi, I'm Daniel 👋", typewriter text, rotating job titles
- Identical rounded cards with soft grey shadows
- Logo walls, skill bars, GitHub-stats widgets
- Arrows appended to every link
- Middle-dot meta strings
- Mono type used for decoration
- Animating every section on enter

## 11. Open items (from Daniel)

- [x] Loan system is under NDA: keep the abstracted ledger only, no real UI.
- [x] Repos: Cachet https://github.com/Idhaniel/cachet, Supply chain https://github.com/Idhaniel/Supply-Chain-Public, E-commerce https://github.com/Idhaniel/monarch-stores-public. Most other work is private or under NDA.
- [x] Photo: `src/assets/daniel.jpg`
- [x] Résumé PDF, at `public/resume.pdf`
- [x] Availability: open to any role, remote preferred, can start now.
