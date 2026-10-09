# DONECASH — Delivery Status and Boundaries

Release 1.0 · Prepared 9 October 2026 · Predevelopment handover.

## What is delivered

| Area | Evidence | Status |
|---|---|---|
| Analysis/planning | Eight English Markdown documents | Delivered editorial baseline |
| Financial-domain rules | Business logic, accounting example and acceptance catalogue | Specified, not implemented |
| Database | PostgreSQL baseline SQL and ERD | Source delivered; database execution not certified |
| Customer design | 36 listed mobile routes and platform shells | Navigation prototype delivered |
| Operations design | 22 backoffice routes | Navigation prototype delivered |
| Visual presentation | Contact sheets, individual captures and English wireframe board | Delivered browser-rendered artifacts |
| Brand sources | PNG/SVG originals, Illustrator master and full supplied design-system files | Preserved |
| Presentation | Offline portal, HTML document reader and walkthrough guide | Delivered |
| Packaging | File inventory/checksums and archive | Generated and validated |

## Not delivered as working software

No NestJS backend, Next.js application, React Native native build, Prisma schema/migration history, real authentication, provider adapter implementation, operating database, automated financial test suite, merchant/agent standalone portal, real-money service, store release or recorded demonstration video.

The prototype does not enforce actual PINs, OTPs, consent, KYC, fees, balances, duplicate protection, approvals or authorization. Many secondary controls are illustrative. Financial and dashboard data are synthetic. Route availability must not be described as completed end-to-end financial execution.

## Delivery-edition corrections

- Translated/edited Arabic planning documents and the legacy wireframe into English, retaining original research links and dates.
- Corrected the EGP 375 transfer + EGP 5 fee ledger example to debit EGP 380.
- Aligned documented idempotency scope with the physical SQL's wallet-based constraint.
- Clarified the RACI go-live row and separate approval gates.
- Replaced malformed fee-clamp pseudocode and clarified unknown cash-out expiry.
- Changed the SQL default locale to English; multilingual fields remain.
- Removed blanket claims of complete design-system/accessibility compliance.
- Repaired a bill CTA targeting a nonexistent route and introduced contextual payment/status previews for bill, merchant and cash journeys. These remain simulations, not business-logic execution.
- Relabeled unsupported claims of complete flows/available Arabic and distinguished synthetic dashboard figures from research evidence.
- Made screenshot tooling portable and added individual screen exports and current packaging validation.

Original working files were preserved. Changes described here apply to the independent delivery edition.

## Required before implementation sign-off

1. Approve requirements and all critical states, including failure/recovery and large text.
2. Finalize sponsor/legal model, policies, chart of accounts and finality contracts.
3. Specify OpenAPI payloads/errors, persistence of quotes/provider inbox and extended merchant settlement/refunds.
4. Harden SQL: journal/posting completeness, matching currencies, immutable journal semantics, authoritative funds/limit locks and payload-aware idempotency.
5. Finalize credential storage, OIDC/device proof, secrets, retention, audit and permission enforcement.
6. Build shared token/components, licensed fonts/icon set and native accessibility behavior.

## Required before real-money launch

Written legal/sponsor and rail access; KYC/AML controls; provider UAT; multi-day reconciliation; independent security assessment; verified native accessibility/device compatibility; load/concurrency/idempotency tests; backup/restore/DR drills; on-call, complaints/escalation and store approval. None is certified by the current screenshot or navigation checks.

## Approval record

| Gate | Owner | Decision/date |
|---|---|---|
| Product scope | Product owner/client | Pending recorded approval |
| Visual design and copy | Product/design/client | Pending recorded approval |
| Accounting | Finance | Pending |
| Legal/compliance | Legal/compliance/sponsor | Pending |
| Security and architecture | Engineering/security | Pending |

This table is a sign-off template, not a representation of approvals already obtained.
