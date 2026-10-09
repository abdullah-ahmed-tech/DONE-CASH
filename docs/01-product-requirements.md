# DONECASH — Product Requirements

English handover edition · Requirements baseline, not a claim that the requirements have been implemented. Targets below require validation during development and pilot operation.

## 1. Product definition and scope

An EGP digital wallet for individuals in Egypt, with merchant/agent capabilities and an integrated internal operations system. The portfolio edition uses synthetic customers and simulated providers. Real-money operation requires approved sponsorship/licensing and certified integrations.

### Goals

1. Make sending, receiving, cash services and everyday payments clear and secure.
2. Prevent avoidable recipient, fee and duplicate-payment mistakes.
3. Preserve financial integrity through balanced, immutable accounting.
4. Give support, risk, compliance and finance traceable workflows with controlled authority.
5. Provide an English-first, accessible cross-platform experience suitable for low-bandwidth use; plan Arabic/RTL localization separately.

### Outside the MVP

Lending, interest-bearing products, FX and outbound remittances, BNPL/crypto, proprietary card issuance, open-banking aggregation, children's wallets and building an owned nationwide agent network. Card funding and incoming remittance require separate commercial/technical approval.

## 2. Stakeholder identification

| Stakeholder | Interest | Influence | Engagement |
|---|---|---|---|
| Individual customer | Safe, simple sending, receiving and payment | High | Interviews, usability sessions, product analytics |
| Merchant/small business | QR acceptance, settlement and statements | High | Pilot and weekly feedback |
| Cash agent | Verified service, evidence, commission and liquidity | High | SOPs, training and liquidity monitoring |
| Product owner | Value, scope and priorities | High | Weekly product council |
| Finance/treasury | Correct balances, reconciliation and closing | Critical | Ledger and reconciliation sign-off |
| Compliance/MLRO | KYC, AML/CFT, screening and reporting | Critical | Gates before financial releases |
| Fraud/risk | Account takeover, fraud and loss prevention | Critical | Real-time rules and case management |
| Customer support | Resolve issues without exposing secrets or changing funds | High | Scoped permissions and Customer 360 |
| Engineering/SRE/security | Availability, integrity and observability | Critical | ADRs, threat modeling and runbooks |
| Internal audit | Tamper-resistant evidence | High | Read-only access and periodic review |
| CBE/NTRA | Compliance, consumer protection and service stability | Critical | Formal approvals, reporting and communications |
| Sponsor bank/Meeza/PSP/billers | Settlement, service levels and dispute liability | Critical | Contracts and certification |
| Stores/SMS/KYC vendors | Distribution, delivery and verification | Medium/high | Vendor governance, DPA and SLA |

### Responsibility matrix

R = Responsible; A = Accountable; C = Consulted; I = Informed.

| Decision | Product | Engineering | Compliance | Finance | Security | Operations |
|---|---|---|---|---|---|---|
| MVP scope | A/R | C | C | C | C | C |
| KYC/AML and limits | C | C | A/R | C | C | I |
| Ledger design | C | R | C | A | C | I |
| Security risk acceptance | I | C | C | I | A/R | I |
| Financial reconciliation | I | C | C | A/R | I | C |
| Go-live preparation | A | R | C | C | C | R |

Go-live additionally requires separate recorded compliance, finance and security approvals. This clarifies the original matrix's multiple accountable signatories; it does not waive any gate.

## 3. Requirements gathering

### Proposed research plan

No completed customer interviews or usability results are evidenced in the source files. The following is the planned validation work:

1. Semi-structured interviews with 8–12 users across age, region and wallet experience.
2. Interviews with an agent, support representative, fraud analyst, compliance officer and reconciliation accountant.
3. Official competitor-page analysis of onboarding, transfer, withdrawal, bills and QR.
4. CBE/NTRA and legal review covering licensing, consumer rights and accessibility.
5. Money-movement event storming: initiated → authorized → posted → settled/failed/reversed.
6. Prototype testing of onboarding, transfer and dispute journeys.

### Research questions

- What makes customers confident enough to confirm a recipient? Is a masked name sufficient?
- Where do fees, remaining limits and processing/completed states cause confusion?
- How do customers behave on weak networks or delayed provider responses?
- Which support contacts can be prevented through better UI?
- What evidence do fraud analysts and accountants need to resolve a payment?

| Assumption | Test | Target |
|---|---|---|
| Phone is the easiest transfer identifier | Compare phone, QR and beneficiaries | ≥80% first-attempt success |
| Masked recipient reduces wrong transfers | Review-screen experiment | ≥30% fewer simulated errors |
| Home shortcuts improve speed | Task test | Transfer P50 <45 seconds |
| Users understand processing | Comprehension test | ≥85% select the correct action |
| Upfront fees improve trust | Interview and customer effort assessment | Clarity ≥4/5 |

## 4. Functional requirements

### Customer application

| ID | Area | Requirement | Priority |
|---|---|---|---|
| FR-001 | Onboarding | Egyptian mobile registration, OTP and trusted-device binding | Must |
| FR-002 | KYC | Identity data/media capture, consent and review tracking | Must |
| FR-003 | Authentication | At least six-digit MPIN, optional biometrics and safe recovery | Must |
| FR-004 | Wallet | Available/held balance and daily/monthly limits | Must |
| FR-005 | P2P | Recipient check, fee quote, transfer and shareable receipt | Must |
| FR-006 | Beneficiaries | Saved alias and first-transfer warning | Should |
| FR-007 | Cash | ATM/agent deposit instructions and withdrawal requests with expiring code | Must |
| FR-008 | Bills | Inquiry, payment and own/other-number top-up | Must |
| FR-009 | Merchant payment | QR scan, merchant/amount verification and payment | Must |
| FR-010 | Activity | Search/filter, status, reference and fee details | Must |
| FR-011 | Disputes | Transaction-linked case, evidence and SLA/status tracking | Should |
| FR-012 | Notifications | Financial/security push/SMS and in-app inbox | Must |
| FR-013 | Profile | Non-sensitive profile, device management, MPIN change and wallet closure | Must |
| FR-014 | Accessibility | VoiceOver/TalkBack, text scaling, contrast and equivalent cues | Must |

### Merchant and agent capabilities

| ID | Requirement | Priority |
|---|---|---|
| FR-101 | Static/dynamic merchant QR linked to a branch | Should |
| FR-102 | Receipts, daily settlements and downloadable statement | Should |
| FR-103 | Policy-controlled full/partial refund with approval | Could |
| FR-104 | Verified cash service and transaction evidence | Should |
| FR-105 | Agent liquidity and terminal/staff limits | Could |

Merchant/agent standalone portals are future implementation scope; they are not separate delivered prototypes.

### Backoffice

| ID | Area | Requirement | Priority |
|---|---|---|---|
| FR-201 | Customer 360 | Controlled search, customer/KYC/wallet/device/activity context | Must |
| FR-202 | KYC | Queue, review, more-information and reason-coded decisions | Must |
| FR-203 | Risk | Alerts, score/evidence, linked cases and maker-checker restriction/release | Must |
| FR-204 | Transactions | End-to-end trace, ledger/provider references and controlled retry/reversal | Must |
| FR-205 | Support | Tickets, timeline, templates, SLA and sensitive-data masking | Must |
| FR-206 | Reconciliation | Import, match, exceptions and closing | Must |
| FR-207 | Policy | Versioned fees/limits by customer, channel and operation | Must |
| FR-208 | IAM | RBAC, SSO/MFA, segregation of duties and access review | Must |
| FR-209 | Audit | Append-only sensitive-read, change and financial-action record | Must |
| FR-210 | Reporting | Controlled financial, operational and regulatory exports | Should |

### Core business rules

- One wallet per mobile number; national-ID wallet count is regulatory policy (the original reference described up to three), not a hard-coded assumption.
- EGP only in the MVP; currency remains explicit on every monetary record.
- Debits require appropriate authorization after recipient, fee and total review.
- Fees/limits are effective-dated policies, with the decision version retained.
- Posted entries cannot be edited; corrections use linked reversing entries.
- Financial command endpoints require an idempotency key. Identical retries return the original result; a changed payload with the same key is rejected.
- Support cannot reveal MPIN/OTP, edit ledger postings or independently override compliance.

## 5. Non-functional requirements

These are proposed production acceptance targets, not measured results.

| ID | Dimension | Target |
|---|---|---|
| NFR-001 | Availability | Financial monthly uptime 99.95%; non-critical 99.9% |
| NFR-002 | Latency | Internal read P95 ≤400ms; initiation ≤1.5s excluding provider latency |
| NFR-003 | Integrity | Balanced journals; no negative available balance without explicit approved overdraft policy |
| NFR-004 | Recovery | Production-MVP RPO ≤5 minutes, RTO ≤60 minutes; quarterly restore tests |
| NFR-005 | Scale | Planning baseline: 1M registered, 100k DAU, peak 100 TPS; test 3× load |
| NFR-006 | Security | ASVS 5 level 2 baseline, MASVS, transport/storage encryption, secrets manager and staff MFA |
| NFR-007 | Privacy | Minimization, purpose limitation, retention matrix, DSAR and vendor DPA |
| NFR-008 | Auditability | Every sensitive action includes actor, device/IP, reason, correlation and appropriate before/after evidence |
| NFR-009 | Accessibility | WCAG 2.2 AA where applicable, 48dp targets, assistive technology and planned RTL |
| NFR-010 | Observability | Traces, metrics and structured logs across API, queue and provider |
| NFR-011 | Compatibility | Current and previous two major iOS/Android versions; graceful low-bandwidth behavior |
| NFR-012 | Maintainability | Domain boundaries, ≥80% ledger/risk coverage and adapter contract tests |
| NFR-013 | Localization | English first, externalized text; later Arabic pluralization/RTL; EGP and E.164 formatting |
| NFR-014 | Explainability | Internal reason code and safe customer explanation for each restriction/decline |

## 6. User stories and acceptance criteria

### US-01 — Registration and verification

As a new customer, I want to verify my phone and identity so that I can safely activate my wallet.

- A valid eligible phone creates a time-limited, attempt-limited OTP challenge.
- Wrong/expired codes do not activate the account; codes never appear in logs.
- Required consent records document version, time and channel; marketing is separate.
- Wallet activation requires approved KYC and successful MPIN setup.

### US-02 — Login and device binding

As a returning customer, I want secure access without losing control over trusted devices.

- Successful MPIN/device proof establishes a scoped session.
- Five failed attempts trigger the configured cooldown; limits are policy-controlled.
- Biometrics unlock a device-bound key rather than send biometric data to the server.
- A new device requires additional verification and an account-security notification.

### US-03 — Wallet transfer

As a customer, I want to verify who receives my money and the total cost before sending.

- Review shows a masked recipient, amount, fee, total debit and resulting available balance.
- Expired quotes require refresh and reconfirmation; insufficient balance/limits prevent debit.
- Authorization binds customer intent to recipient, amount and quote.
- Duplicate identical submissions produce one financial effect and the same receipt.
- Notifications follow committed outcomes; external timeout displays processing, not failure.

### US-04 — Limit protection

As a customer, I want to understand remaining capacity and avoid an invalid payment.

- Usage shows policy, window and reset timezone (Africa/Cairo).
- A command exceeding the effective limit is rejected before posting.
- Concurrent requests cannot bypass the limit.
- Historical decisions retain the effective policy version.

### US-05 — ATM/agent cash-out

As a customer, I want a withdrawal code that is secure and traceable.

- The code has a short expiry, is single-use and is bound to channel and amount.
- Available funds are reserved; only authoritative provider confirmation captures the hold.
- Expiry/cancellation safely releases eligible holds; duplicates cannot dispense/post twice.
- Unknown provider outcomes remain processing and enter inquiry/reconciliation.

### US-06 — Bill payment

As a customer, I want to see what I owe and know whether the bill was paid.

- Inquiry alone creates no ledger posting.
- The review shows biller, subscriber reference, amount, fee and quote expiry.
- Duplicate bill references/requests are handled by provider-aware protection.
- Timeout remains processing and is resolved through inquiry/reconciliation.

### US-07 — Merchant QR

As a customer, I want to confirm a legitimate merchant and amount before payment.

- Invalid, expired or unverifiable QR payloads are rejected.
- Dynamic signed QR amount cannot be edited; static QR allows validated amount entry.
- Merchant name/branch, amount and fees appear before authorization.
- Scanning a QR alone never counts as successful payment.

### US-08 — Activity and receipt

As a customer, I want a reliable history and evidence for each payment.

- Activity filters by date/type/status using stable pagination.
- Detail includes timeline, amount, fee, public reference and counterparty snapshot.
- Receipt reflects actual status, including processing/reversal.
- Shared receipts contain neither identity-document data nor secrets.

### US-09 — Transaction dispute

As a customer, I want to request help and follow the case without repeating payment.

- Eligibility and duplicate-open-reason checks precede submission.
- Evidence upload is validated and access-controlled.
- Case reference, SLA and message timeline remain visible.
- A complaint does not automatically reverse money; resolution uses approved operations.

### US-10 — KYC review

As a KYC analyst, I want evidence and safe decision controls.

- Role/assignment permits access to watermarked, controlled document views.
- Approval, rejection and more-information decisions require reason codes.
- Sensitive/high-risk decisions follow the applicable maker-checker policy.
- Evidence access and decisions are audited; safe reasons reach the customer.

### US-11 — Customer 360

As a support/compliance employee, I want relevant context without unnecessary disclosure.

- Exact lookup requires a reason and is rate-limited/audited.
- Sensitive fields are masked; reveal requires permission and a recorded reason.
- Customer, KYC, wallets, devices and activity link consistently.
- No MPIN/OTP or editable ledger controls are exposed.

### US-12 — Risk investigation

As a fraud analyst, I want explainable evidence and controlled containment.

- Alerts retain rule version, input snapshot, score and time.
- Cases link affected customers, devices and transactions.
- Restriction/release requests require reason and second-person approval where applicable.
- Customer messaging does not disclose detection rules or accuse the customer.

### US-13 — Reconciliation

As a reconciliation accountant, I want to resolve discrepancies without rewriting history.

- File/provider ingestion is idempotent and validates totals/references.
- Matching preserves internal and external evidence.
- Exceptions enter investigation; no direct posting edits are permitted.
- Approved resolution creates a linked adjustment/reversal and re-runs matching.

### US-14 — Fee and limit policy management

As an authorized policy owner, I want controlled, testable changes.

- Versions include scope and effective dates; overlapping policy selection is deterministic.
- Preview covers at least ten representative/boundary cases.
- Draft → submitted → approved → effective lifecycle separates maker and checker.
- Pending approvals do not affect live commands; every activation is audited.

## 7. Minimum viable product

### Customer MVP

Phone/OTP, consent, KYC, MPIN/device trust, balances/holds/limits, P2P, one cash rail, basic bills/top-up, verified QR, activity/receipts, financial/security notifications and basic support/security settings.

### Operations MVP

Customer 360, KYC review, transaction/ledger trace, risk cases, support, reconciliation, policy approval, RBAC and audit. Merchant/agent expansion is prioritized separately.

### Demonstration vertical slice

Simulated deposit EGP 2,500 → transfer EGP 375 with a disclosed fee → receipt → provider timeout on a bill → processing → finance reconciliation → support case. These scenarios describe the intended end-to-end application slice; the delivered navigation prototype does not implement a financial engine.

### Future implementation definition of done

- Automated acceptance coverage for Must requirements and invariant tests for accounting.
- No unresolved unacceptable Critical/High security findings.
- Restore/incident drill and operational runbooks demonstrated.
- At least 80% unaided critical-flow completion in moderated testing.
- 200% text/accessibility review completed on representative devices.

## 8. MoSCoW prioritization

| Must have | Should have | Could have | Won't have now |
|---|---|---|---|
| Onboarding/KYC/consent | Saved beneficiaries | Partner-backed virtual card | Lending/BNPL |
| MPIN/OTP/device binding | Merchant portal | Cashback/coupons | Crypto/FX |
| Wallet/double-entry ledger | Agent operations | Incoming international remittance | Physical card |
| P2P/fees/limits | Advanced disputes | Recurring bills | Investment/savings |
| Cash adapters | English and future Arabic help | Request to Pay | Owned agent network |
| Bills/top-up/QR | Advanced fraud graph | Merchant refunds | Full microservice architecture |
| Activity/receipts/alerts | Scheduled reports | Family wallets | Multi-region active-active |
| Backoffice/audit | Data warehouse/BI | Voice-assisted flow | Offline stored value |
| Reconciliation | | | |

Could items are optional expansion candidates, not committed MVP deliverables. Eligibility, safeguarding and accessibility remain Must regardless of presentation emphasis.

## 9. Product KPIs

| Stage | Indicator | Proposed definition |
|---|---|---|
| Acquisition | KYC completion rate | Submitted / onboarding started; track approved completion separately |
| Activation | First successful value movement | Within seven days of activation |
| Engagement | Transacting MAU | Customer with a successful financial transaction in the month |
| Trust | Wrong-recipient contact rate | Wrong-recipient complaints / completed P2P |
| Reliability | Financial success rate | Completed / authorized, excluding user declines |
| Risk | Fraud loss basis points | Confirmed fraud loss / processed value ×10,000 |
| Support | First-contact resolution | Resolved without reopening/escalation |
| Operations | Reconciliation break rate | Unmatched items / external items |

Segment by provider/channel/cohort. Report pending separately and agree measurement horizons; these are proposed definitions, not observed DONECASH metrics.

## 10. Open risks and decisions

Sponsor/licensing model; final approved fees/limits; future USSD/non-smartphone reach; digital-financial-identity eligibility; vendor finality/reversal rules; store legal-entity requirements; customer evidence retention and accessibility sign-off. None is resolved by a visual approval alone.

## Sources

1. Central Bank of Egypt, [Rules for Licensing and Registration of PSOs and PSPs](https://www.cbe.org.eg/en/news-publications/news/2025/06/19/08/20/psos-and-psps-licensing-rules), 19 June 2025.
2. Orange Egypt, [Orange Cash E-Wallet](https://www.orange.eg/en/services/Orange-financial-services), accessed 13 September 2026.
3. Vodafone Egypt, [Vodafone Cash](https://web.vodafone.com.eg/en/vodafone-cash), accessed 13 September 2026.
4. e& Egypt, [e& money](https://www.eand.com.eg/portal/pages/services/eand_money_en.html), accessed 13 September 2026.
5. National Telecom Regulatory Authority, [Mobile Wallets Regulatory Rules](https://www.tra.gov.eg/en/mobile-wallets-regulatory-rules/), accessed 13 September 2026.
6. NTRA, [Instructions for Mobile Wallet Accessibility](https://www.tra.gov.eg/en/ntra-issues-instructions-to-facilitate-the-use-of-mobile-e-wallet-services-for-people-of-determination/), 4 December 2024.
7. OWASP, [Application Security Verification Standard 5.0](https://owasp.github.io/www-project-application-security-verification-standard/), 2025.
8. OWASP, [Mobile Application Security Verification Standard](https://mas.owasp.org/MASVS/), accessed 13 September 2026.
9. Android Accessibility Help, [Touch Target Size](https://support.google.com/accessibility/android/answer/7101858), accessed 13 September 2026.
10. Central Bank of Egypt, [Digital Financial Identity](https://www.cbe.org.eg/en/payment-systems-and-services/digital-financial-identity), updated 23 August 2026.
11. Apple Developer, [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), accessed 13 September 2026.

