# DONECASH — Final English Design Gallery

The [interactive prototype](../prototype/index.html) is the source for final UI screenshots. The delivery portal provides a browsable gallery. Platform screenshots are browser-rendered iOS/Android shells, not native-app captures.

## Review order

1. `final/00-prototype-hub.png` — product/design scope.
2. `final/01-mobile-ios-home.png` and `02-mobile-android-home.png` — platform previews.
3. `final/10-mobile-ios-01.png` through `03.png` — all 36 iOS routes.
4. `final/10-mobile-android-01.png` through `03.png` — the same 36 Android routes.
5. `final/03-backoffice-overview.png` — operations overview.
6. `final/20-backoffice-01.png` through `04.png` — all 22 backoffice routes.
7. `wireframes.html` / `wireframes.png` — English low-fidelity critical-flow board.

## Coverage

| Images | Coverage |
|---|---|
| Mobile sheet 01 | Secure launch, onboarding, KYC, MPIN, login and Home |
| Mobile sheet 02 | P2P, cash services, bills and scanner |
| Mobile sheet 03 | Merchant review, activity, support, notifications and account/security |
| Backoffice sheet 01 | Overview, customers, KYC and transaction search |
| Backoffice sheet 02 | Transaction trace, risk, support and reconciliation batches |
| Backoffice sheet 03 | Reconciliation exceptions, policies, approvals and IAM |
| Backoffice sheet 04 | Audit, reports, provider health and templates |

[manifest.json](final/manifest.json) maps images to routes. Individual mobile images and full-resolution operations captures are additionally exported under `final/screens/` in this delivery so that each screen can be reviewed without zooming into a contact sheet. There are 72 mobile platform captures and 22 operations captures.

## Reproduction

See [tools/README.md](../tools/README.md). Rendering regenerates only the validated delivery `design/final/` path, preserving wireframes and brand sources. Route-render checks do not certify all financial interactions, accessibility or native behavior.

Legacy Arabic wireframes and incomplete first UI previews are excluded. The English wireframe board deliberately covers critical flows; the full page inventory is represented in the prototype/contact sheets.
