-- DONECASH PostgreSQL 16+ baseline schema
-- Monetary values are stored as integer minor units (piastres for EGP).
-- Apply with a dedicated migration role; application roles must not own these tables.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('PENDING_KYC','ACTIVE','RESTRICTED','SUSPENDED','CLOSED')),
  full_name_ar text,
  full_name_en text,
  national_id_ciphertext bytea,
  national_id_hash bytea UNIQUE,
  date_of_birth date,
  risk_tier text NOT NULL DEFAULT 'STANDARD' CHECK (risk_tier IN ('LOW','STANDARD','HIGH','PROHIBITED')),
  locale text NOT NULL DEFAULT 'en-EG',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

CREATE TABLE customer_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  phone_e164 text NOT NULL UNIQUE CHECK (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  phone_hash bytea UNIQUE,
  is_primary boolean NOT NULL DEFAULT false,
  ownership_verified_at timestamptz,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING','ACTIVE','PORTING','SUSPENDED','RELEASED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_customer_primary_phone
  ON customer_phones(customer_id) WHERE is_primary AND status = 'ACTIVE';

CREATE TABLE customer_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  consent_type text NOT NULL,
  document_version text NOT NULL,
  granted boolean NOT NULL,
  channel text NOT NULL,
  ip_address inet,
  device_id uuid,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, consent_type, document_version, occurred_at)
);

CREATE TABLE devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  device_fingerprint_hash bytea NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ANDROID','IOS','WEB')),
  app_version text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','TRUSTED','REVOKED','BLOCKED')),
  last_seen_at timestamptz,
  trusted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, device_fingerprint_hash)
);

ALTER TABLE customer_consents
  ADD CONSTRAINT fk_consent_device FOREIGN KEY (device_id) REFERENCES devices(id);

CREATE TABLE auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  device_id uuid NOT NULL REFERENCES devices(id),
  refresh_token_hash bytea NOT NULL UNIQUE,
  assurance_level smallint NOT NULL CHECK (assurance_level BETWEEN 1 AND 3),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE auth_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  phone_id uuid REFERENCES customer_phones(id),
  device_id uuid REFERENCES devices(id),
  purpose text NOT NULL,
  secret_hash bytea NOT NULL,
  attempts smallint NOT NULL DEFAULT 0,
  max_attempts smallint NOT NULL DEFAULT 5,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE kyc_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  status text NOT NULL CHECK (status IN ('DRAFT','SUBMITTED','IN_REVIEW','MORE_INFO_REQUIRED','APPROVED','REJECTED','EXPIRED')),
  level text NOT NULL DEFAULT 'BASIC',
  provider_code text,
  provider_reference text,
  decision_reason_code text,
  submitted_at timestamptz,
  decided_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_code, provider_reference)
);

CREATE TABLE kyc_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_case_id uuid NOT NULL REFERENCES kyc_cases(id),
  document_type text NOT NULL,
  side text CHECK (side IN ('FRONT','BACK','PORTRAIT','OTHER')),
  object_key text NOT NULL,
  content_sha256 bytea NOT NULL,
  status text NOT NULL DEFAULT 'UPLOADED' CHECK (status IN ('UPLOADED','SCANNED','VERIFIED','REJECTED','DELETED_BY_RETENTION')),
  retention_until date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kyc_case_id, document_type, side, content_sha256)
);

CREATE TABLE screening_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_case_id uuid NOT NULL REFERENCES kyc_cases(id),
  screening_type text NOT NULL,
  provider_code text NOT NULL,
  provider_reference text,
  outcome text NOT NULL CHECK (outcome IN ('CLEAR','POTENTIAL_MATCH','CONFIRMED_MATCH','ERROR')),
  score numeric(6,3),
  result_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  screened_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ledger_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code text NOT NULL UNIQUE,
  account_name text NOT NULL,
  account_class text NOT NULL CHECK (account_class IN ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE','CLEARING')),
  owner_type text NOT NULL CHECK (owner_type IN ('CUSTOMER','MERCHANT','AGENT','PLATFORM','PROVIDER')),
  owner_id uuid,
  currency char(3) NOT NULL DEFAULT 'EGP',
  normal_side text NOT NULL CHECK (normal_side IN ('DEBIT','CREDIT')),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','FROZEN','CLOSED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES customers(id),
  phone_id uuid NOT NULL REFERENCES customer_phones(id),
  ledger_account_id uuid NOT NULL UNIQUE REFERENCES ledger_accounts(id),
  currency char(3) NOT NULL DEFAULT 'EGP',
  status text NOT NULL CHECK (status IN ('PENDING_KYC','ACTIVE','RESTRICTED','SUSPENDED','CLOSED')),
  provider_code text,
  provider_reference text,
  activated_at timestamptz,
  closed_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_code, provider_reference)
);

CREATE UNIQUE INDEX ux_active_wallet_phone_currency
  ON wallets(phone_id, currency) WHERE status IN ('ACTIVE','RESTRICTED','SUSPENDED');

CREATE TABLE beneficiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  target_wallet_id uuid REFERENCES wallets(id),
  target_phone_e164 text,
  alias text,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','BLOCKED','DELETED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (target_wallet_id IS NOT NULL OR target_phone_e164 IS NOT NULL)
);

CREATE TABLE payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text NOT NULL UNIQUE,
  wallet_id uuid NOT NULL REFERENCES wallets(id),
  transaction_type text NOT NULL CHECK (transaction_type IN ('P2P_TRANSFER','CASH_IN','CASH_OUT','BILL_PAYMENT','TOP_UP','MERCHANT_PAYMENT','REFUND','REVERSAL','ADJUSTMENT')),
  status text NOT NULL CHECK (status IN ('CREATED','AUTHORIZED','PROCESSING','COMPLETED','DECLINED','FAILED','REVERSAL_PENDING','REVERSED','CANCELLED')),
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  fee_minor bigint NOT NULL DEFAULT 0 CHECK (fee_minor >= 0),
  currency char(3) NOT NULL DEFAULT 'EGP',
  idempotency_key text NOT NULL,
  correlation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_code text,
  external_reference text,
  failure_code text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  authorized_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (wallet_id, idempotency_key),
  UNIQUE (provider_code, external_reference)
);

CREATE INDEX ix_payment_wallet_created ON payment_transactions(wallet_id, created_at DESC);
CREATE INDEX ix_payment_status_created ON payment_transactions(status, created_at);
CREATE INDEX ix_payment_correlation ON payment_transactions(correlation_id);

CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  transaction_id uuid UNIQUE REFERENCES payment_transactions(id),
  entry_type text NOT NULL,
  currency char(3) NOT NULL DEFAULT 'EGP',
  status text NOT NULL DEFAULT 'POSTED' CHECK (status IN ('PENDING','POSTED','REVERSED')),
  reversal_of_id uuid UNIQUE REFERENCES journal_entries(id),
  description text,
  posted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ledger_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES journal_entries(id),
  ledger_account_id uuid NOT NULL REFERENCES ledger_accounts(id),
  direction text NOT NULL CHECK (direction IN ('DEBIT','CREDIT')),
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  signed_amount_minor bigint NOT NULL CHECK (signed_amount_minor <> 0),
  currency char(3) NOT NULL DEFAULT 'EGP',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((direction = 'DEBIT' AND signed_amount_minor = amount_minor) OR
         (direction = 'CREDIT' AND signed_amount_minor = -amount_minor))
);

CREATE INDEX ix_postings_entry ON ledger_postings(journal_entry_id);
CREATE INDEX ix_postings_account_created ON ledger_postings(ledger_account_id, created_at);

CREATE OR REPLACE FUNCTION prevent_posting_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Ledger postings are immutable; post a reversal entry instead';
END;
$$;

CREATE TRIGGER trg_postings_immutable
BEFORE UPDATE OR DELETE ON ledger_postings
FOR EACH ROW EXECUTE FUNCTION prevent_posting_mutation();

CREATE OR REPLACE FUNCTION assert_journal_entry_balanced()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  target_entry uuid;
  posting_count integer;
  net_amount bigint;
  currency_count integer;
BEGIN
  target_entry := COALESCE(NEW.journal_entry_id, OLD.journal_entry_id);
  SELECT count(*), COALESCE(sum(signed_amount_minor), 0), count(DISTINCT currency)
    INTO posting_count, net_amount, currency_count
  FROM ledger_postings WHERE journal_entry_id = target_entry;

  IF posting_count < 2 OR net_amount <> 0 OR currency_count <> 1 THEN
    RAISE EXCEPTION 'Unbalanced journal entry %: postings %, net %, currencies %',
      target_entry, posting_count, net_amount, currency_count;
  END IF;
  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER trg_journal_balanced
AFTER INSERT OR UPDATE OR DELETE ON ledger_postings
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION assert_journal_entry_balanced();

CREATE TABLE wallet_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id),
  transaction_id uuid REFERENCES payment_transactions(id),
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency char(3) NOT NULL DEFAULT 'EGP',
  reason_code text NOT NULL,
  status text NOT NULL CHECK (status IN ('ACTIVE','CAPTURED','RELEASED','EXPIRED')),
  expires_at timestamptz,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ix_wallet_active_holds ON wallet_holds(wallet_id, expires_at) WHERE status = 'ACTIVE';

CREATE TABLE transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL UNIQUE REFERENCES payment_transactions(id),
  source_wallet_id uuid NOT NULL REFERENCES wallets(id),
  destination_wallet_id uuid NOT NULL REFERENCES wallets(id),
  note text,
  recipient_name_snapshot text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (source_wallet_id <> destination_wallet_id)
);

CREATE TABLE cash_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL UNIQUE REFERENCES payment_transactions(id),
  operation_type text NOT NULL CHECK (operation_type IN ('CASH_IN','CASH_OUT')),
  channel_type text NOT NULL CHECK (channel_type IN ('ATM','AGENT','BRANCH','CARD')),
  channel_reference text,
  one_time_code_hash bytea,
  code_expires_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE billers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text,
  category text NOT NULL,
  provider_code text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE bill_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL UNIQUE REFERENCES payment_transactions(id),
  biller_id uuid NOT NULL REFERENCES billers(id),
  subscriber_reference text NOT NULL,
  bill_reference text,
  due_amount_minor bigint,
  paid_amount_minor bigint NOT NULL CHECK (paid_amount_minor > 0),
  inquiry_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text NOT NULL UNIQUE,
  legal_name text NOT NULL,
  display_name text NOT NULL,
  category_code text,
  settlement_ledger_account_id uuid REFERENCES ledger_accounts(id),
  status text NOT NULL CHECK (status IN ('PENDING','ACTIVE','SUSPENDED','CLOSED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE merchant_qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES merchants(id),
  qr_type text NOT NULL CHECK (qr_type IN ('STATIC','DYNAMIC')),
  payload_hash bytea NOT NULL UNIQUE,
  amount_minor bigint CHECK (amount_minor > 0),
  currency char(3) NOT NULL DEFAULT 'EGP',
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','USED','EXPIRED','REVOKED')),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fee_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_code text NOT NULL,
  version integer NOT NULL,
  transaction_type text NOT NULL,
  customer_segment text NOT NULL DEFAULT 'ALL',
  channel text NOT NULL DEFAULT 'ALL',
  calculation_type text NOT NULL CHECK (calculation_type IN ('FLAT','PERCENTAGE','TIERED')),
  flat_minor bigint CHECK (flat_minor >= 0),
  percentage_bps integer CHECK (percentage_bps >= 0),
  min_minor bigint CHECK (min_minor >= 0),
  max_minor bigint CHECK (max_minor >= 0),
  tiers jsonb,
  status text NOT NULL CHECK (status IN ('DRAFT','SCHEDULED','ACTIVE','RETIRED')),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (policy_code, version),
  CHECK (effective_to IS NULL OR effective_to > effective_from)
);

CREATE TABLE limit_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_code text NOT NULL,
  version integer NOT NULL,
  customer_segment text NOT NULL,
  transaction_type text NOT NULL DEFAULT 'ALL',
  period_type text NOT NULL CHECK (period_type IN ('PER_TRANSACTION','DAILY','MONTHLY','ROLLING')),
  amount_limit_minor bigint NOT NULL CHECK (amount_limit_minor > 0),
  count_limit integer,
  status text NOT NULL CHECK (status IN ('DRAFT','SCHEDULED','ACTIVE','RETIRED')),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (policy_code, version),
  CHECK (effective_to IS NULL OR effective_to > effective_from)
);

CREATE TABLE limit_consumptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id),
  limit_policy_id uuid NOT NULL REFERENCES limit_policies(id),
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  consumed_amount_minor bigint NOT NULL DEFAULT 0 CHECK (consumed_amount_minor >= 0),
  consumed_count integer NOT NULL DEFAULT 0 CHECK (consumed_count >= 0),
  version integer NOT NULL DEFAULT 1,
  UNIQUE (wallet_id, limit_policy_id, window_start)
);

CREATE TABLE risk_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code text NOT NULL,
  version integer NOT NULL,
  name text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  expression jsonb NOT NULL,
  action text NOT NULL CHECK (action IN ('ALLOW','CHALLENGE','HOLD','DECLINE','REVIEW')),
  status text NOT NULL CHECK (status IN ('DRAFT','ACTIVE','RETIRED')),
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  UNIQUE (rule_code, version)
);

CREATE TABLE risk_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_rule_id uuid NOT NULL REFERENCES risk_rules(id),
  customer_id uuid REFERENCES customers(id),
  transaction_id uuid REFERENCES payment_transactions(id),
  severity text NOT NULL,
  score numeric(7,3),
  status text NOT NULL CHECK (status IN ('OPEN','IN_REVIEW','DISMISSED','CONFIRMED','ESCALATED')),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE risk_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text NOT NULL UNIQUE,
  customer_id uuid REFERENCES customers(id),
  priority text NOT NULL CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status text NOT NULL CHECK (status IN ('OPEN','IN_REVIEW','WAITING','RESOLVED','CLOSED')),
  resolution_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE risk_case_alerts (
  risk_case_id uuid NOT NULL REFERENCES risk_cases(id),
  risk_alert_id uuid NOT NULL REFERENCES risk_alerts(id),
  PRIMARY KEY (risk_case_id, risk_alert_id)
);

CREATE TABLE disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES customers(id),
  transaction_id uuid NOT NULL REFERENCES payment_transactions(id),
  reason_code text NOT NULL,
  status text NOT NULL CHECK (status IN ('OPEN','IN_REVIEW','WAITING_CUSTOMER','ACCEPTED','REJECTED','CLOSED')),
  resolution_code text,
  sla_due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_open_dispute_reason
  ON disputes(customer_id, transaction_id, reason_code)
  WHERE status IN ('OPEN','IN_REVIEW','WAITING_CUSTOMER');

CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL UNIQUE,
  customer_id uuid REFERENCES customers(id),
  dispute_id uuid REFERENCES disputes(id),
  category text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL CHECK (status IN ('OPEN','IN_PROGRESS','WAITING_CUSTOMER','RESOLVED','CLOSED')),
  sla_due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ticket_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id),
  event_type text NOT NULL,
  actor_type text NOT NULL CHECK (actor_type IN ('CUSTOMER','STAFF','SYSTEM')),
  actor_id uuid,
  message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reconciliation_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_code text NOT NULL,
  business_date date NOT NULL,
  source_file_name text,
  source_file_sha256 bytea,
  status text NOT NULL CHECK (status IN ('RECEIVED','PROCESSING','REVIEW_REQUIRED','COMPLETED','FAILED')),
  total_items integer NOT NULL DEFAULT 0,
  total_amount_minor bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (provider_code, business_date, source_file_sha256)
);

CREATE TABLE reconciliation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES reconciliation_batches(id),
  transaction_id uuid REFERENCES payment_transactions(id),
  external_reference text NOT NULL,
  external_amount_minor bigint NOT NULL,
  external_status text NOT NULL,
  match_status text NOT NULL CHECK (match_status IN ('MATCHED','NOT_FOUND_INTERNAL','NOT_FOUND_EXTERNAL','AMOUNT_MISMATCH','STATUS_MISMATCH','DUPLICATE')),
  resolution_code text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (batch_id, external_reference)
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  transaction_id uuid REFERENCES payment_transactions(id),
  channel text NOT NULL CHECK (channel IN ('PUSH','SMS','EMAIL','IN_APP')),
  template_code text NOT NULL,
  template_version integer NOT NULL,
  status text NOT NULL CHECK (status IN ('QUEUED','SENT','DELIVERED','FAILED','SUPPRESSED')),
  destination_masked text,
  provider_reference text,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type text NOT NULL,
  event_version integer NOT NULL DEFAULT 1,
  payload jsonb NOT NULL,
  correlation_id uuid,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  attempts integer NOT NULL DEFAULT 0
);

CREATE INDEX ix_outbox_unpublished ON outbox_events(occurred_at) WHERE published_at IS NULL;

CREATE TABLE staff_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  display_name text NOT NULL,
  department text NOT NULL,
  status text NOT NULL CHECK (status IN ('INVITED','ACTIVE','SUSPENDED','DISABLED')),
  external_identity_id text UNIQUE,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_sensitive boolean NOT NULL DEFAULT false
);

CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text NOT NULL
);

CREATE TABLE staff_roles (
  staff_user_id uuid NOT NULL REFERENCES staff_users(id),
  role_id uuid NOT NULL REFERENCES roles(id),
  assigned_by uuid REFERENCES staff_users(id),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  PRIMARY KEY (staff_user_id, role_id)
);

CREATE TABLE role_permissions (
  role_id uuid NOT NULL REFERENCES roles(id),
  permission_id uuid NOT NULL REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  maker_id uuid NOT NULL REFERENCES staff_users(id),
  checker_id uuid REFERENCES staff_users(id),
  status text NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED','EXPIRED','EXECUTED')),
  reason text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  CHECK (checker_id IS NULL OR checker_id <> maker_id)
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type text NOT NULL CHECK (actor_type IN ('CUSTOMER','STAFF','SERVICE','SYSTEM')),
  actor_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  reason_code text,
  ip_address inet,
  device_id uuid,
  correlation_id uuid,
  before_data jsonb,
  after_data jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  previous_hash bytea,
  event_hash bytea NOT NULL
);

CREATE INDEX ix_audit_actor_time ON audit_logs(actor_id, occurred_at DESC);
CREATE INDEX ix_audit_resource_time ON audit_logs(resource_type, resource_id, occurred_at DESC);

-- Recommended privileges:
-- 1) deny UPDATE/DELETE on journal_entries, ledger_postings, audit_logs to app roles;
-- 2) expose posting through a SECURITY DEFINER procedure owned by a migration/ledger role;
-- 3) enforce row-level or service-level access boundaries for PII and operational domains.
