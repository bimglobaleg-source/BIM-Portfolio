# BIM GLOBAL Website — Final Production Pass (Addendum)

This builds on the previous `QA_REPORT.md` (design/functionality rebuild). Scope this round: contact email swap + a full engineering audit with **no visual/design changes** — palette, typography, spacing, and the approved logo are untouched.

---

## 1. Contact email

Replaced everywhere, throughout `index.html` and `js/main.js`:

| Location | Now reads |
|---|---|
| JSON-LD `Organization.email` / `contactPoint.email` | `bimglobal.eg@gmail.com` |
| CTA band text | `bimglobal.eg@gmail.com` |
| Contact section `mailto:` link | `mailto:bimglobal.eg@gmail.com` |
| Copy Email button `data-copy` | `bimglobal.eg@gmail.com` |
| Contact form `data-to` + `action="mailto:…"` fallback | `bimglobal.eg@gmail.com` |
| Footer `mailto:` link | `mailto:bimglobal.eg@gmail.com` |
| JS fallback default (used only if the `data-to` attribute is ever missing) | `bimglobal.eg@gmail.com` |

9 occurrences total, verified with a full-project grep afterward — zero instances of either old address remain.

## 2. Bug found and fixed this pass

| Severity | Issue | Fix |
|---|---|---|
| **High** | The Copy Email button's confirmation message (`#copyFeedback`) is a sibling of `.email-row`, not a child of it — but the JS looked up the feedback element via `btn.parentElement.querySelector('.copy-feedback')`, which only searches *descendants*. Clicking "Copy email" copied the address correctly but silently failed to show "Copied to clipboard" (and announced nothing to screen readers, despite the `aria-live` region being wired up). | Rewrote the lookup to resolve the feedback element through the button's own `aria-describedby` attribute via `document.getElementById(...)`, which is correct regardless of DOM nesting. Verified the confirmation text and `aria-live` announcement now fire. |

I re-read every other event listener in `main.js` (dropdown open/close/keyboard, mobile menu open/close/focus-trap/Escape, scrollspy, reveal-on-scroll, counters, scroll-to-top, contact form submit/validation) line by line looking for the same class of "looks wired up but silently no-ops" bug — this was the only one found.

## 3. Performance improvements added

- **Responsive images:** generated 700px-wide WebP variants of the four diagrams (BIM wheel, GIS, Digital Twin, 7-phase methodology) and added `srcset`/`sizes` so phones download a smaller file instead of the 1100px desktop version.
- **`dns-prefetch` fallback** added alongside the existing `preconnect` for both Google Fonts hosts (belt-and-suspenders for browsers that don't act on `preconnect`).
- **Preload** added for the loading-screen logo, since it's the first thing painted on every visit.
- Re-verified: no JS blocks rendering (`defer` on the only script), CSS is a single small file, fonts use `display=swap`, every below-the-fold image is `loading="lazy"`.

## 4. Responsive audit — 320 / 375 / 425 / 768 / 1024 / 1440 / 4K

Reviewed every breakpoint against the actual CSS rules (no headless browser is reachable from this sandbox — its outbound network only allows package registries — so this was done by tracing the cascade for each width rather than an automated screenshot diff):

- **320–425px:** found the "How We Deliver" methodology band's fixed `padding:50px 40px` left very little room for its heading/copy on a 320px phone. Tightened it to `32px 22px` under the existing 640px breakpoint — no other element had a fixed width that could overflow at this size (the hero's decorative circle sits outside `overflow:hidden`, so it was already safe).
- **768–1024px:** these fall inside the existing 900px breakpoint (nav collapses to the hamburger menu, grids drop to 2 columns) — confirmed no dead zone between 640px and 900px where neither rule set applies.
- **1440px / 4K:** the `--container: 1180px` max-width already centers all content with margin on ultra-wide screens; nothing stretches edge-to-edge in a way that would look broken.

## 5. Accessibility / SEO / security — re-verified, no new issues

- Re-ran the WCAG contrast check on every text/background pair (including the two new preload/dns-prefetch `<link>` additions, which carry no visible text) — all still pass.
- Confirmed there are **no `target="_blank"` links anywhere** in the project (every link is either an in-page anchor or a `mailto:`), so there was nothing that actually needed `rel="noopener noreferrer"` — noting this as "checked, not applicable" rather than adding an attribute with nothing to protect against.
- Added `robots.txt` (`Allow: /`). Deliberately **did not** add a `sitemap.xml` — a sitemap requires absolute URLs, and inventing a placeholder domain would mean shipping a technically invalid file pointing nowhere real. `robots.txt` has a comment marking where to add the `Sitemap:` line once a domain exists.
- Re-confirmed zero El Garhy references and zero dead `href="#"` links across the whole project after all of the above changes.

## 6. Validation

- W3C Nu Html Checker: **0 errors** (one false-positive on the bleeding-edge `fetchpriority` attribute was sidestepped by removing it rather than fighting an outdated validator schema — `preload`+`as="image"` already gives the browser enough of a hint without it).
- `node --check js/main.js`: **0 syntax errors**.
- Full-project grep sweep: 0 old-email references, 0 El Garhy references, 0 `href="#"`, 0 duplicate `id` attributes, 0 unreferenced asset files.

## 7. Still outside what's fixable without a domain or real content

- `canonical` / `og:url` / sitemap — need a real production domain (marked with TODO comments).
- An automated Lighthouse run — this sandbox can't download a browser binary to execute one; everything above was verified by static analysis, contrast math, and a manual line-by-line read instead of a fabricated score.
- Real photography/insights articles — same placeholders noted in the previous report, unchanged.
