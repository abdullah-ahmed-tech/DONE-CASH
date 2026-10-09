# DONECASH — Presentation Guide

## Preparation

Extract the complete archive, open `START-HERE.html` and test the three prototype links before presenting. Use a desktop browser at roughly 1600×1000 for the full inventory and review panel. Narrow browser views hide prototype review sidebars; the phone remains a design preview rather than a native app.

Keep this opening statement explicit: **“This delivery covers the product blueprint, database baseline and interactive design before implementation. All data and payments in this demo are simulated.”**

## Suggested 12-minute walkthrough

| Time | Topic | Show |
|---|---|---|
| 0–1 min | Product value and boundaries | Portal and delivery status |
| 1–2 min | Market and operational trust | Research brief; confirm-before-send and trace-after-send thesis |
| 2–4 min | Customer flow | Mobile: Onboarding → simulated KYC approval → Home → Recipient → Amount → Review → Authorization → Receipt |
| 4–5 min | Platform adaptation | Switch iOS/Android; explain native QA still required |
| 5–6 min | Honest pending | Bills → inquiry → simulated authorization → processing detail; do not pay again |
| 6–8 min | Operations | Customer search → Customer 360 → trace; then reconciliation/approval/audit pages |
| 8–9 min | Full screen coverage | Screenshot gallery, contact sheets and individual exports |
| 9–10 min | Financial/technical design | Ledger example, ERD/SQL, modular architecture, API and business rules |
| 10–11 min | Launch dependency | External integrations, sponsor and certification gates |
| 11–12 min | Approval and next phase | Delivery status, open decisions and sign-off template |

## Direct demo entry points

- [Onboarding](../prototype/mobile.html#splash)
- [Send money](../prototype/mobile.html#recipient)
- [Bills](../prototype/mobile.html#billers)
- [Merchant QR](../prototype/mobile.html#qr)
- [Cash deposit](../prototype/mobile.html#cash-in)
- [Cash withdrawal](../prototype/mobile.html#cash-out)
- [Transaction support](../prototype/mobile.html#transaction-detail)
- [Account/security](../prototype/mobile.html#profile)
- [Customer 360](../prototype/backoffice.html#customer-360)
- [Transaction trace](../prototype/backoffice.html#transaction-trace)
- [Reconciliation exceptions](../prototype/backoffice.html#recon-exceptions)
- [Approvals](../prototype/backoffice.html#approvals)
- [Audit](../prototype/backoffice.html#audit)

Use flow-entry buttons to initialize coherent simulated contexts. Inputs do not drive real calculations and secondary controls are not all active. The shared receipt/status route can vary by journey; the static contact sheets show a representative state.

## Presenter talking points

“The balance is not an editable wallet field; it comes from postings and holds.” “Timeout does not prove failure.” “Support has context, not unrestricted money powers.” “Fees and limits are policies, not hard-coded regulatory guesses.” “A modular monolith supports atomic finance operations before distributed complexity.”

## Questions to capture at sign-off

Are all screens and recovery states approved? Who signs off accounting and compliance? Which sponsor/rails are available? Which fees/limits are contractually confirmed? What is the first implementation vertical slice? Which assets/device/accessibility tests are required before release?

Do not claim measured uptime, actual transaction volume, live vendor connectivity, full WCAG compliance or an App Store/Google Play build based on this package.
