# DONECASH — Design-System Audit and Improvement Plan

English handover edition · Original reference inspection: 13 September 2026. This handover review separates evidenced brand use from unverified production conformance.

## 1. Honest conclusion

The supplied foundation is used visibly and the product extension is imported by the prototype. **It is not accurate to certify complete, error-free application of every design-system rule.** The first preview was incomplete; the English prototype improves route coverage but still uses font fallbacks, text/glyph icons, compact type, mixed hard-coded values and illustrative rather than fully implemented component states.

The earlier audit's blanket “complete” claims—especially minimum body typography and accessibility—are not repeated as certified results. The delivery includes all supplied design-system files unmodified and documents the non-destructive product layer separately.

## 2. Original reference evidence

The source audit recorded local review of `DESIGN (1).md`, `tokens.json`, `variables.css`, `theme.css`, DONECASH PNG/SVG assets and the UGLYCASH site. Its reported measurements were:

| Element | Reference observation |
|---|---|
| Canvas | `#f2f2f2` |
| Structure | Black text/borders |
| Display typography | Helvetica Now Display Cn Bold |
| UI/body | Inter with Roboto/SF Pro/system surfaces |
| Display sizes | 164, 85 and 64px marketing scale |
| Small/body sizes | 12, 14, 18, 20 and 24px |
| Accents | Cyan `#02bbff`, Pink `#fa00ff`, Lime `#adff02`, Khaki `#e7e3bf` |
| Dark | `#000100`, `#3a3a3a` |
| Large radii | 38, 43 and 46px |
| Control radii | Approximately 15–16px; secondary 23px |
| Composition | Oversized headline, phone frame, floating navigation and outlined sticker character |

Those are retained historical observations, not a new October site measurement. Secondary grays must be semantic tokens rather than copied ad hoc.

## 3. Delivery coverage matrix

| Rule | Delivery evidence | Assessment |
|---|---|---|
| Cream canvas, white/dark surfaces and saturated panels | Visible in hub/mobile/backoffice | Applied brand foundation |
| Black structural borders and no conventional shadows | Prototype CSS treatment | Applied core visual language |
| Lime primary actions | Primary buttons and selection | Applied |
| Supplied logo/icon | Local PNG/SVG references | Applied; original masters included |
| Large frame/marketing composition | Prototype phone/hub | Applied with contextual variants |
| Original typography | Family aliases/system and condensed fallbacks | Not guaranteed font matching; font files absent |
| Minimum readable body text | Several selectors use 10–12px | Requires production sizing review; not fully conformant |
| Exact token/radius discipline | Source includes 28/30px and direct values | Contextual variants need documented aliases or alignment |
| Comfortable spacing | Product and dense operations layouts differ | Intentional density extension, not identical marketing rhythm |
| All component states | Default pages plus selected examples | Not exhaustive interactive state coverage |
| English-first UI | 36 mobile and 22 operations route labels/content | Applied; future Arabic is not implemented |
| Accessibility/device certification | Requirements and platform shell only | Not verified; native QA remains |

## 4. Brand is not a literal landing-page copy

Separate brand expression (logo, palette, condensed headings, sticker decoration) from product clarity (readable names/numbers/forms/statuses) and operations density (tables, timelines, masking/approvals). Marketing's 164px type and tilted illustrations should not be imposed on financial review screens.

## 5. Product extension and recommended improvements

The included [product-extension.css](../Design%20System/product-extension.css) extends rather than replaces [variables.css](../Design%20System/variables.css). Review the actual file for the implemented aliases; the following is the intended extension contract, not a claim that every component consumes every token.

### Semantic colors

```css
--color-status-success-bg: #adff02;
--color-status-processing-bg: #02bbff;
--color-status-attention-bg: #e7e3bf;
--color-status-danger-bg: #ffd8d8;
--color-status-danger-ink: #7a0000;
--color-focus-ring: #000000;
--color-disabled-bg: #e3e3e3;
--color-disabled-ink: #6e6e6e;
--color-divider: #c8c8c8;
```

Pink remains a brand color, not the default destructive signal. Validate every foreground/background pairing.

### Typography

Licensed condensed display font for short marketing headings; Inter 14–18px for product text; bold tabular financial numbers; 12–14px references where readable. Do not use condensed faces for long names, amounts or long action labels. Supply licensed WOFF2/OTF/TTF files for predictable rendering.

### States and financial components

Specify default/hover/pressed/focus/disabled/loading, validation/warning/success, selected/unread/processing and destructive confirmation. Define amount input/keypad, masked-recipient block, fee/total breakdown, status/timeline, receipt/reference, privacy/holds, limit meter and balanced ledger table.

### Operations density

Comfortable mobile, default web and compact operations modes; table rows around 44px minimum, role-aware ~236px sidebar and split review workspaces. Reveal-with-reason is a standard component. Bulk actions must not enable uncontrolled money changes.

### Accessibility and responsive layout

48px mobile and approximately 40px web targets, visible 2px focus ring/offset, non-color status cues and documented 200% scaling. Define compact mobile 320–374, standard mobile 375–479, tablet 768–1023, operations 1024–1439 and wide operations ≥1440. The prototype shell is not a validated responsive native implementation at all these sizes.

### Motion and icons

120–180ms small transitions, 220–280ms page/sheet changes, no looping financial-success animation and reduced-motion fallback. Use one coherent 20–24px SVG icon system inside adequately sized targets. Textual symbols are prototype placeholders, not final production artwork.

## 6. What the English prototype improved

English-first screen copy; full listed route representation; clickable navigation; platform-shell previews; preserved brand assets; semantic product extension; operations-specific density and financial content. It does not establish that every error/recovery path, interaction, font, target or contrast pairing has passed acceptance testing.

## 7. Design approval checklist

Token rather than unexplained hex; correct font role; explicit currency/tabular numbers; structural border/elevation; approved radius; text plus shape for statuses; one clear primary action; touch/focus/keyboard/assistive states; empty/loading/error/offline/processing/disabled specs; clear English; disclosed fees. Record approval per screen and state, not solely per contact sheet.

## 8. Recommendation

Retain **Brand Foundation v1** and evolve **Product UI Extension v1** without overwriting the supplied identity. Prioritize coherent semantic state patterns, readable financial UI, accessibility and operational controls over adding decorative colors. Native implementation should replace prototype-specific direct values with a reviewed shared token/component library.

## 9. Additional production assets

| Priority | Asset | Needed specification |
|---|---|---|
| P0 | Licensed font files | Selected web/native weights with clear redistribution rights |
| P0 | Production icon family | 24px SVG grid, consistent stroke and selected states |
| P0 | KYC overlays | Front/back/selfie/liveness vectors without real personal data |
| P0 | Store assets | Native screenshots, feature graphic, adaptive Android icon and compliant store exports |
| P1 | Service pictograms | Transfer, utilities, ATM, merchant and donation categories |
| P1 | Empty/error/offline art | 6–8 brand-consistent sticker illustrations with readable alternatives |
| P1 | Motion | Short Lottie/Rive assets with static/reduced-motion fallback |
| P1 | Merchant/agent markers | Verified/unavailable/degraded states |
| P2 | Marketing compositions | Device/sticker scenes derived from the owned brand |

The included Illustrator master, logos and app icons are valuable source assets. No stock portraits are required for financial screens. Production iconography and licensed fonts are the highest-priority missing visual inputs. Reference-site artwork is not included or represented as owned DONECASH artwork.

## 10. iOS and Android adaptation

Shared information architecture with native insets, accessibility, secure storage, biometrics and verified links. Keep biometric templates local. Implement iOS App Attest and Android Play Integrity as risk signals with unsupported-device fallback. Review golden screens at 320/375/390/430px, small/standard Android and foldable sizes, and large-text settings. Existing screenshots evidence browser design coverage only.

## Sources

UGLYCASH, [Official product website](https://ugly.cash/), visually inspected and computed-style sampled 13 September 2026.

