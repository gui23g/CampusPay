-- CampusPay MVP schema
-- Run this file in Supabase SQL Editor for a fresh project.

create extension if not exists pgcrypto;

do $$
begin
  create type public.campaign_status as enum (
    'draft',
    'in_review',
    'approved',
    'selling',
    'production',
    'pickup',
    'closed',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_rail as enum ('pix', 'solana');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum (
    'created',
    'pending',
    'confirmed',
    'failed',
    'expired',
    'refunded'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.member_role as enum (
    'owner',
    'president',
    'treasurer',
    'operator',
    'auditor'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.buyer_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  campus text,
  institution text,
  phone text,
  wallet_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text not null default 'system',
  email_notifications boolean not null default true,
  whatsapp_notifications boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint user_preferences_theme_check check (theme in ('system', 'light', 'dark'))
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  institution text not null,
  campus text not null,
  type text not null,
  treasury_wallet text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null,
  active boolean not null default true,
  starts_at date not null default current_date,
  ends_at date,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role public.member_role not null,
  token_hash text not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text not null,
  purpose text not null,
  status public.campaign_status not null default 'draft',
  campus_slug text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  min_units integer not null default 0,
  goal_units integer not null default 0,
  public_report_id text unique,
  created_by uuid references public.profiles(id),
  approved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_versions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  version integer not null,
  payload jsonb not null,
  payload_hash text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (campaign_id, version)
);

create table if not exists public.campaign_approvals (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  campaign_version_id uuid not null references public.campaign_versions(id) on delete cascade,
  approver_id uuid references public.profiles(id),
  role public.member_role not null,
  decision text not null,
  note text,
  decided_at timestamptz not null default now(),
  constraint campaign_approvals_decision_check check (decision in ('approved', 'rejected'))
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null,
  label text not null,
  price_cents integer not null,
  currency text not null default 'BRL',
  target_quantity integer not null default 0,
  stock_quantity integer not null default 0,
  active boolean not null default true,
  unique (product_id, sku),
  constraint product_variants_price_check check (price_cents >= 0)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  buyer_id uuid references public.profiles(id),
  buyer_email text not null,
  code text not null unique,
  status text not null default 'created',
  amount_cents integer not null,
  currency text not null default 'BRL',
  pickup_pin_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_amount_check check (amount_cents >= 0)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id),
  quantity integer not null,
  unit_price_cents integer not null,
  constraint order_items_quantity_check check (quantity > 0),
  constraint order_items_price_check check (unit_price_cents >= 0)
);

create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  rail public.payment_rail not null,
  status public.payment_status not null default 'created',
  amount_cents integer not null,
  currency text not null default 'BRL',
  reference text not null unique,
  expires_at timestamptz,
  provider_payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  payment_intent_id uuid not null references public.payment_intents(id) on delete cascade,
  rail public.payment_rail not null,
  status public.payment_status not null,
  amount_cents integer not null,
  currency text not null default 'BRL',
  external_id text,
  solana_signature text,
  confirmed_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.ledger_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  code text not null,
  name text not null,
  currency text not null default 'BRL',
  unique (organization_id, campaign_id, code)
);

create table if not exists public.ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  memo text not null,
  idempotency_key text not null unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.ledger_transactions(id) on delete cascade,
  account_id uuid not null references public.ledger_accounts(id),
  debit_cents integer not null default 0,
  credit_cents integer not null default 0,
  constraint ledger_entry_non_negative check (debit_cents >= 0 and credit_cents >= 0),
  constraint ledger_entry_single_side check (
    (debit_cents > 0 and credit_cents = 0) or (debit_cents = 0 and credit_cents > 0)
  )
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  storage_path text not null,
  kind text not null,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.production_batches (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  supplier_name text not null,
  planned_units integer not null,
  produced_units integer not null default 0,
  status text not null default 'planned',
  expected_at date,
  received_at date,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id),
  movement_type text not null,
  quantity integer not null,
  source_type text not null,
  source_id uuid,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.pickup_windows (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  place text not null,
  capacity integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.fulfillments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  pickup_window_id uuid references public.pickup_windows(id),
  status text not null default 'scheduled',
  confirmed_by uuid references public.profiles(id),
  confirmed_at timestamptz,
  idempotency_key text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.report_snapshots (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  canonical_payload jsonb not null,
  payload_hash text not null,
  public_id text not null unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.blockchain_anchors (
  id uuid primary key default gen_random_uuid(),
  report_snapshot_id uuid not null references public.report_snapshots(id) on delete cascade,
  chain text not null default 'solana',
  cluster text not null default 'devnet',
  signature text,
  program_id text,
  payload_hash text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  area text not null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.active = true
  );
$$;

create or replace function public.is_org_admin(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.active = true
      and membership.role in ('owner', 'president', 'treasurer')
  );
$$;

alter table public.profiles enable row level security;
alter table public.buyer_profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_invites enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_versions enable row level security;
alter table public.campaign_approvals enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_intents enable row level security;
alter table public.payments enable row level security;
alter table public.ledger_accounts enable row level security;
alter table public.ledger_transactions enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.documents enable row level security;
alter table public.production_batches enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.pickup_windows enable row level security;
alter table public.fulfillments enable row level security;
alter table public.report_snapshots enable row level security;
alter table public.blockchain_anchors enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "buyer_profiles_self" on public.buyer_profiles;
create policy "buyer_profiles_self" on public.buyer_profiles
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "user_preferences_self" on public.user_preferences;
create policy "user_preferences_self" on public.user_preferences
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "organizations_member_select" on public.organizations;
create policy "organizations_member_select" on public.organizations
  for select to authenticated using (public.is_org_member(id));

drop policy if exists "organizations_authenticated_insert" on public.organizations;
create policy "organizations_authenticated_insert" on public.organizations
  for insert to authenticated with check (created_by = auth.uid());

drop policy if exists "organizations_admin_update" on public.organizations;
create policy "organizations_admin_update" on public.organizations
  for update to authenticated using (public.is_org_admin(id));

drop policy if exists "memberships_member_select" on public.organization_memberships;
create policy "memberships_member_select" on public.organization_memberships
  for select to authenticated using (public.is_org_member(organization_id));

drop policy if exists "memberships_admin_write" on public.organization_memberships;
create policy "memberships_admin_write" on public.organization_memberships
  for all to authenticated using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

drop policy if exists "invites_admin_write" on public.organization_invites;
create policy "invites_admin_write" on public.organization_invites
  for all to authenticated using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

drop policy if exists "campaigns_public_or_member_select" on public.campaigns;
create policy "campaigns_public_or_member_select" on public.campaigns
  for select using (status in ('approved', 'selling', 'production', 'pickup', 'closed') or public.is_org_member(organization_id));

drop policy if exists "campaigns_member_write" on public.campaigns;
create policy "campaigns_member_write" on public.campaigns
  for all to authenticated using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

drop policy if exists "campaign_versions_member_select" on public.campaign_versions;
create policy "campaign_versions_member_select" on public.campaign_versions
  for select to authenticated using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and public.is_org_member(c.organization_id)
    )
  );

drop policy if exists "products_public_or_member_select" on public.products;
create policy "products_public_or_member_select" on public.products
  for select using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id
        and (c.status in ('approved', 'selling', 'production', 'pickup', 'closed') or public.is_org_member(c.organization_id))
    )
  );

drop policy if exists "variants_public_or_member_select" on public.product_variants;
create policy "variants_public_or_member_select" on public.product_variants
  for select using (
    exists (
      select 1 from public.products p
      join public.campaigns c on c.id = p.campaign_id
      where p.id = product_id
        and (c.status in ('approved', 'selling', 'production', 'pickup', 'closed') or public.is_org_member(c.organization_id))
    )
  );

drop policy if exists "orders_buyer_or_member_select" on public.orders;
create policy "orders_buyer_or_member_select" on public.orders
  for select to authenticated using (buyer_id = auth.uid() or public.is_org_member(organization_id));

drop policy if exists "orders_buyer_insert" on public.orders;
create policy "orders_buyer_insert" on public.orders
  for insert to authenticated with check (buyer_id = auth.uid());

drop policy if exists "orders_member_update" on public.orders;
create policy "orders_member_update" on public.orders
  for update to authenticated using (public.is_org_member(organization_id));

drop policy if exists "order_items_buyer_or_member_select" on public.order_items;
create policy "order_items_buyer_or_member_select" on public.order_items
  for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.buyer_id = auth.uid() or public.is_org_member(o.organization_id))
    )
  );

drop policy if exists "payment_intents_buyer_or_member_select" on public.payment_intents;
create policy "payment_intents_buyer_or_member_select" on public.payment_intents
  for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.buyer_id = auth.uid() or public.is_org_member(o.organization_id))
    )
  );

drop policy if exists "payments_buyer_or_member_select" on public.payments;
create policy "payments_buyer_or_member_select" on public.payments
  for select to authenticated using (
    exists (
      select 1
      from public.payment_intents pi
      join public.orders o on o.id = pi.order_id
      where pi.id = payment_intent_id
        and (o.buyer_id = auth.uid() or public.is_org_member(o.organization_id))
    )
  );

drop policy if exists "ledger_member_select" on public.ledger_accounts;
create policy "ledger_member_select" on public.ledger_accounts
  for select to authenticated using (public.is_org_member(organization_id));

drop policy if exists "ledger_transactions_member_select" on public.ledger_transactions;
create policy "ledger_transactions_member_select" on public.ledger_transactions
  for select to authenticated using (public.is_org_member(organization_id));

drop policy if exists "ledger_entries_member_select" on public.ledger_entries;
create policy "ledger_entries_member_select" on public.ledger_entries
  for select to authenticated using (
    exists (
      select 1
      from public.ledger_transactions lt
      where lt.id = transaction_id and public.is_org_member(lt.organization_id)
    )
  );

drop policy if exists "documents_member_select" on public.documents;
create policy "documents_member_select" on public.documents
  for select to authenticated using (public.is_org_member(organization_id));

drop policy if exists "production_batches_member_select" on public.production_batches;
create policy "production_batches_member_select" on public.production_batches
  for select to authenticated using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and public.is_org_member(c.organization_id)
    )
  );

drop policy if exists "inventory_movements_member_select" on public.inventory_movements;
create policy "inventory_movements_member_select" on public.inventory_movements
  for select to authenticated using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and public.is_org_member(c.organization_id)
    )
  );

drop policy if exists "pickup_windows_public_select" on public.pickup_windows;
create policy "pickup_windows_public_select" on public.pickup_windows
  for select using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id
        and (c.status in ('approved', 'selling', 'production', 'pickup', 'closed') or public.is_org_member(c.organization_id))
    )
  );

drop policy if exists "fulfillments_buyer_or_member_select" on public.fulfillments;
create policy "fulfillments_buyer_or_member_select" on public.fulfillments
  for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.buyer_id = auth.uid() or public.is_org_member(o.organization_id))
    )
  );

drop policy if exists "report_public_select" on public.report_snapshots;
create policy "report_public_select" on public.report_snapshots
  for select using (true);

drop policy if exists "anchors_public_select" on public.blockchain_anchors;
create policy "anchors_public_select" on public.blockchain_anchors
  for select using (true);

drop policy if exists "audit_events_member_select" on public.audit_events;
create policy "audit_events_member_select" on public.audit_events
  for select to authenticated using (
    organization_id is not null and public.is_org_member(organization_id)
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product_images_authenticated_upload" on storage.objects;
create policy "product_images_authenticated_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');
