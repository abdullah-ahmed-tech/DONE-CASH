# DONECASH — Final English Handover

**Release:** 1.0 · **Prepared:** 9 October 2026 · **Stage:** Product blueprint and interactive design, before application development.

DONECASH is an Egyptian digital-wallet concept covering a customer experience for iOS and Android and an integrated operations backoffice. This self-contained package brings together the work completed during analysis, planning and design. All delivery documentation and user-facing prototype copy are in English.

## Start here

Open [START-HERE.html](START-HERE.html) in a browser for the presentation portal, document reader and screenshot gallery. No build, account, backend or internet connection is needed for the prototype. External research links need internet access. Unzip the entire package before opening it; keep the directory structure unchanged.

For a guided presentation, follow [the presentation guide](handover/PRESENTATION-GUIDE.md). For an accurate statement of completion and remaining work, read [delivery status](handover/DELIVERY-STATUS.md).

## Deliverables

| File | Purpose |
|---|---|
| [00 — Research brief](docs/00-research-brief.md) | Market evidence, competitor inventory and product decisions |
| [01 — Product requirements](docs/01-product-requirements.md) | Stakeholders, gathering plan, functional/non-functional requirements, user stories, acceptance criteria, MVP and MoSCoW |
| [02 — Database design](docs/02-database-design.md) | Entities, attributes, relationships, ERD, 3NF, ledger design and physical-schema handoff |
| [03 — Technical design](docs/03-technical-design.md) | Stack, architecture, API endpoints, security and deployment |
| [04 — UX/UI design](docs/04-ux-ui-design.md) | Sitemaps, full page inventory, user flows, wireframes and UI specifications |
| [05 — Business logic](docs/05-business-logic.md) | Domain rules, state transitions, financial invariants, operations and test scenarios |
| [06 — Design-system audit](docs/06-design-system-audit.md) | Brand application, documented extensions, limitations and missing production assets |
| [07 — External integrations](docs/07-external-integrations.md) | Payment rails, identity, communications, vendor evaluation and market-entry gates |
| [SQL baseline](database/schema.sql) | PostgreSQL schema source; not a deployed database or completed Prisma implementation |
| [Prototype hub](prototype/index.html) | Interactive presentation entry point |
| [Mobile prototype](prototype/mobile.html) | 36 screen routes with iOS/Android presentation modes |
| [Backoffice prototype](prototype/backoffice.html) | 22 operations routes |
| [Design gallery](design/README.md) | English wireframes and final prototype screenshots |
| [Design system](Design%20System/DESIGN%20%281%29.md) | Supplied reference, tokens and non-destructive product extension |
| [Asset inventory](handover/ASSET-INVENTORY.md) | Original logo/icon PNG, SVG and Illustrator master |
| [Validation report](handover/VALIDATION-REPORT.md) | Packaging checks and the scope of evidence |
| [File manifest](handover/FILE-MANIFEST.json) | File inventory and SHA-256 checksums |

## Scope and truthfulness

- Currency: EGP. English is primary; Arabic is a future localization requirement.
- Recommended implementation: React Native/Expo, Next.js, NestJS modular monolith, PostgreSQL and Prisma.
- The delivered HTML is a navigation/design prototype using synthetic data, not an implemented financial application. Inputs and many secondary controls illustrate the intended UI rather than execute business rules.
- Screenshots show browser-rendered platform shells; they are not evidence of native iOS/Android builds or device certification.
- Research sources retain their original September 2026 access dates. This release organizes and edits the existing research; it does not claim a new regulatory review on 9 October.
- Licensing/sponsorship, commercial integrations, security assessment, accessibility/device testing and operational approval remain prerequisites for real-money launch.
- Original working files remain outside this delivery folder. Legacy Arabic wireframes are not included; their English edition is included here.

The financial design uses an append-only double-entry ledger. Balance is derived from postings and active holds; support agents must never directly edit customer money.
