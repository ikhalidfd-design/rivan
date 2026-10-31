-- =====================================================================
-- RUWAQ Platform — Migration 0001 (P0 schema)
-- Multi-tenant hospitality SaaS — RLS on every tenant table
-- =====================================================================

create extension if not exists btree_gist;
create extension if not exists pgcrypto;

-- ============ Tenancy & identity ============

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  currency char(3) not null default 'SAR',
  settings jsonb not null default '{"hold_hours": 24}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  locale text not null default 'ar',
  is_super_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- profile تلقائي لكل مستخدم جديد
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create type public.org_role as enum ('org_owner','org_admin','manager','staff','property_owner');

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'staff',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

-- ============ Billing ============

create table public.plans (
  id text primary key,                      -- 'trial' | 'basic' | 'pro'
  name_ar text not null,
  monthly_price numeric(10,2) not null default 0,
  yearly_price numeric(10,2) not null default 0,
  max_units int not null,
  features jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  is_public boolean not null default true
);

insert into public.plans (id, name_ar, monthly_price, yearly_price, max_units, sort_order, features) values
  ('trial', 'تجريبية', 0, 0, 2, 0, '{"ical": true, "direct_booking": true}'),
  ('basic', 'أساسية', 99, 990, 10, 1, '{"ical": true, "direct_booking": true}'),
  ('pro',   'احترافية', 249, 2490, 100, 2, '{"ical": true, "direct_booking": true, "webhooks": true, "api": true}');

create type public.subscription_status as enum ('trialing','active','past_due','canceled','expired');
create type public.billing_interval as enum ('monthly','yearly');

create table public.org_subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  plan_id text not null references public.plans(id),
  interval public.billing_interval not null default 'monthly',
  status public.subscription_status not null default 'trialing',
  trial_ends_at timestamptz,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id)
);

-- ============ Inventory ============

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  city text,
  district text,
  address text,
  created_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  name text not null,
  slug text unique not null,
  ical_token text unique not null default encode(extensions.gen_random_bytes(32), 'hex'),
  is_published boolean not null default false,
  capacity int not null default 2 check (capacity between 1 and 30),
  bedrooms int,
  bathrooms numeric(3,1),
  base_price numeric(10,2) not null check (base_price >= 0),
  weekend_price numeric(10,2),
  cleaning_fee numeric(10,2) not null default 0,
  min_nights int not null default 1 check (min_nights >= 1),
  description text,
  photos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.units (org_id);

create table public.rates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  d daterange not null,
  price numeric(10,2) not null,
  min_nights int,
  note text,
  created_at timestamptz not null default now(),
  exclude using gist (unit_id with =, d with &&)
);

-- ============ Bookings (موحّد: حجوزات + كتل iCal) ============

create type public.booking_kind as enum ('booking','block');
create type public.booking_status as enum ('pending','confirmed','checked_in','checked_out','cancelled','expired','declined');
create type public.booking_source as enum ('manual','direct','ical','api');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  kind public.booking_kind not null default 'booking',
  status public.booking_status not null default 'pending',
  source public.booking_source not null default 'manual',
  check_in date not null,
  check_out date not null,
  guests int not null default 1,
  guest_name text,
  guest_phone text,
  guest_email text,
  total_amount numeric(12,2),
  currency char(3) not null default 'SAR',
  notes text,
  external_ref text,
  expires_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  stay daterange generated always as (daterange(check_in, check_out, '[)')) stored,
  constraint valid_stay check (check_out > check_in),
  constraint guest_required check (kind = 'block' or (guest_name is not null and guest_phone is not null)),
  -- منع الحجز المزدوج على مستوى قاعدة البيانات (ADR 0002)
  exclude using gist (
    unit_id with =,
    stay with &&
  ) where (kind = 'block' or status in ('pending','confirmed','checked_in'))
);

create index on public.bookings (org_id, check_in);
create index on public.bookings (unit_id, stay);

-- ============ iCal ============

create type public.ical_direction as enum ('import','export');

create table public.ical_feeds (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  direction public.ical_direction not null default 'import',
  name text not null,
  url text,
  enabled boolean not null default true,
  last_synced_at timestamptz,
  last_sync_ok_at timestamptz,
  last_status text,
  last_error text,
  etag text,
  created_at timestamptz not null default now(),
  unique (unit_id, direction, url)
);

create table public.ical_events (
  id uuid primary key default gen_random_uuid(),
  feed_id uuid not null references public.ical_feeds(id) on delete cascade,
  uid text not null,
  summary text,
  start_date date not null,
  end_date date not null,
  dtstamp timestamptz,
  block_booking_id uuid references public.bookings(id) on delete set null,
  raw jsonb,
  unique (feed_id, uid)
);

-- ============ Integrations & sync issues ============

create type public.integration_status as enum ('inactive','active','error');

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,                  -- airbnb|booking|gathern|agoda|expedia|moyasar|hyperpay|whatsapp|ttlock|zatca
  status public.integration_status not null default 'inactive',
  credentials_encrypted bytea,
  credentials_hint text,                   -- آخر 4 أحرف فقط — لا قيم كاملة أبدًا
  last_sync_at timestamptz,
  last_sync_ok_at timestamptz,
  last_error text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, provider)
);

create table public.sync_issues (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  source text not null,                    -- 'ical:<feed_id>' | 'integration:<provider>'
  severity text not null default 'warning',-- info|warning|error
  message text not null,
  detail jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.sync_issues (org_id, resolved_at, created_at desc);

-- ============ Audit / Jobs / Ops ============

create table public.audit_logs (
  id bigint generated always as identity primary key,
  org_id uuid not null,
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  diff jsonb,
  ip inet,
  created_at timestamptz not null default now()
);
create index on public.audit_logs (org_id, created_at desc);

create type public.job_status as enum ('pending','running','done','failed','dead');

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  idempotency_key text unique,
  status public.job_status not null default 'pending',
  run_at timestamptz not null default now(),
  attempts int not null default 0,
  max_attempts int not null default 5,
  locked_at timestamptz,
  locked_by text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.jobs (status, run_at) where (status = 'pending');

create table public.job_failures (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null,
  type text not null,
  payload jsonb,
  attempts int not null,
  last_error text,
  failed_at timestamptz not null default now()
);

create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count int not null default 0
);

create table public.webhooks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  url text not null,
  secret text not null default encode(extensions.gen_random_bytes(32), 'hex'),
  events text[] not null default '{}',
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  signature_valid boolean,
  body jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- RLS
-- =====================================================================

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.plans enable row level security;
alter table public.org_subscriptions enable row level security;
alter table public.properties enable row level security;
alter table public.units enable row level security;
alter table public.rates enable row level security;
alter table public.bookings enable row level security;
alter table public.ical_feeds enable row level security;
alter table public.ical_events enable row level security;
alter table public.integrations enable row level security;
alter table public.sync_issues enable row level security;
alter table public.audit_logs enable row level security;
alter table public.jobs enable row level security;
alter table public.job_failures enable row level security;
alter table public.rate_limits enable row level security;
alter table public.webhooks enable row level security;
alter table public.webhook_events enable row level security;

-- دالة العضوية (المصدر الوحيد لفحص الانتماء)
create or replace function public.is_member(org uuid, roles public.org_role[] default null)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = org and m.user_id = auth.uid()
      and (roles is null or m.role = any(roles))
  );
$$;

-- profiles
create policy profiles_self on public.profiles
  for select using (id = auth.uid());
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid() and not is_super_admin);

-- memberships: يراها أعضاء نفس المنظمة فقط
create policy memberships_select on public.memberships
  for select using (is_member(org_id));
create policy memberships_insert on public.memberships
  for insert with check (
    is_member(org_id, array['org_owner','org_admin']::public.org_role[])
    or not exists (select 1 from public.memberships m where m.org_id = memberships.org_id)
  );
create policy memberships_update on public.memberships
  for update using (is_member(org_id, array['org_owner','org_admin']::public.org_role[]))
  with check (is_member(org_id));
create policy memberships_delete on public.memberships
  for delete using (is_member(org_id, array['org_owner','org_admin']::public.org_role[]));

-- organizations
create policy orgs_select on public.organizations
  for select using (is_member(id));
create policy orgs_insert on public.organizations
  for insert with check (true);  -- المستخدم الجديد ينشئ منظمته (تُضاف عضويته عبر RPC)
create policy orgs_update on public.organizations
  for update using (is_member(id, array['org_owner','org_admin']::public.org_role[]));
-- لا delete policy: حذف المنظمة عبر دعم فني فقط (service role)

-- plans: عامة للقراءة
create policy plans_select on public.plans for select using (true);

-- org_subscriptions
create policy subs_select on public.org_subscriptions
  for select using (is_member(org_id));
create policy subs_insert on public.org_subscriptions
  for insert with check (is_member(org_id, array['org_owner']::public.org_role[]));
create policy subs_update on public.org_subscriptions
  for update using (is_member(org_id, array['org_owner']::public.org_role[]));

-- properties
create policy props_select on public.properties for select using (is_member(org_id));
create policy props_insert on public.properties
  for insert with check (is_member(org_id, array['org_owner','org_admin','manager']::public.org_role[]));
create policy props_update on public.properties
  for update using (is_member(org_id, array['org_owner','org_admin','manager']::public.org_role[]));
create policy props_delete on public.properties
  for delete using (is_member(org_id, array['org_owner','org_admin']::public.org_role[]));

-- units: قراءة عامة للمنشورة فقط (حقول آمنة عبر view أدناه) + إدارة للأعضاء
create policy units_select_member on public.units
  for select using (is_member(org_id));
create policy units_insert on public.units
  for insert with check (is_member(org_id, array['org_owner','org_admin','manager']::public.org_role[]));
create policy units_update on public.units
  for update using (is_member(org_id, array['org_owner','org_admin','manager']::public.org_role[]));
create policy units_delete on public.units
  for delete using (is_member(org_id, array['org_owner','org_admin']::public.org_role[]));

create or replace view public.public_units as
  select id, org_id, property_id, name, slug, capacity, bedrooms, bathrooms,
         base_price, weekend_price, min_nights, description,
         photos, is_published
  from public.units
  where is_published;

grant select on public.public_units to anon, authenticated;

-- rates
create policy rates_select on public.rates for select using (is_member(org_id));
create policy rates_write on public.rates
  for insert with check (is_member(org_id, array['org_owner','org_admin','manager']::public.org_role[]));
create policy rates_update on public.rates
  for update using (is_member(org_id, array['org_owner','org_admin','manager']::public.org_role[]));
create policy rates_delete on public.rates
  for delete using (is_member(org_id, array['org_owner','org_admin','manager']::public.org_role[]));

-- bookings: anon لا يدرج مباشرة أبدًا (RPC فقط)
create policy bookings_select on public.bookings for select using (is_member(org_id));
create policy bookings_insert on public.bookings
  for insert with check (is_member(org_id, array['org_owner','org_admin','manager']::public.org_role[]));
create policy bookings_update on public.bookings
  for update using (is_member(org_id))  -- staff يفعّل الوصول/المغادرة
  with check (is_member(org_id));
create policy bookings_delete on public.bookings
  for delete using (is_member(org_id, array['org_owner','org_admin']::public.org_role[]));

-- ical
create policy feeds_select on public.ical_feeds for select using (is_member(org_id));
create policy feeds_write on public.ical_feeds
  for insert with check (is_member(org_id, array['org_owner','org_admin','manager']::public.org_role[]));
create policy feeds_update on public.ical_feeds
  for update using (is_member(org_id, array['org_owner','org_admin','manager']::public.org_role[]));
create policy feeds_delete on public.ical_feeds
  for delete using (is_member(org_id, array['org_owner','org_admin','manager']::public.org_role[]));

create policy events_select on public.ical_events
  for select using (is_member(
    (select f.org_id from public.ical_feeds f where f.id = feed_id)
  ));

-- integrations / sync_issues / audit / webhooks: أعضاء المنظمة (قراءة)، إدارة للمالك/مدير
create policy integ_select on public.integrations for select using (is_member(org_id));
create policy integ_write on public.integrations
  for insert with check (is_member(org_id, array['org_owner','org_admin']::public.org_role[]));
create policy integ_update on public.integrations
  for update using (is_member(org_id, array['org_owner','org_admin']::public.org_role[]));

create policy sync_select on public.sync_issues for select using (is_member(org_id));
create policy sync_update on public.sync_issues
  for update using (is_member(org_id, array['org_owner','org_admin','manager']::public.org_role[]));

create policy audit_select on public.audit_logs
  for select using (is_member(org_id, array['org_owner','org_admin']::public.org_role[]));

create policy hooks_select on public.webhooks for select using (is_member(org_id));
create policy hooks_write on public.webhooks
  for insert with check (is_member(org_id, array['org_owner','org_admin']::public.org_role[]));
create policy hooks_delete on public.webhooks
  for delete using (is_member(org_id, array['org_owner','org_admin']::public.org_role[]));

-- جداول الخدمة: RLS مفعل بلا سياسات → service-role فقط
-- (jobs, job_failures, rate_limits, webhook_events)

-- =====================================================================
-- Pricing
-- =====================================================================

-- عرض أسعار: أساسي/ويكند/تجاوز موسمي + رسوم تنظيف
create or replace function public.calc_quote(
  p_unit_id uuid,
  p_check_in date,
  p_check_out date,
  p_guests int default 1
)
returns table (nights int, nightly_total numeric, cleaning_fee numeric, total numeric)
language plpgsql stable security definer set search_path = public as $$
declare
  u public.units;
  n int;
  cur_day date;
  night_price numeric;
  nightly_total numeric := 0;
  override record;
begin
  if p_check_out <= p_check_in then
    raise exception 'INVALID_DATES';
  end if;

  select * into u from public.units where id = p_unit_id;
  if not found then raise exception 'UNIT_NOT_FOUND'; end if;
  if p_guests < 1 or p_guests > u.capacity then raise exception 'GUESTS_EXCEEDED'; end if;

  n := p_check_out - p_check_in;
  cur_day := p_check_in;
  loop
    exit when cur_day >= p_check_out;
    -- تجاوز نطاق أولًا، وإلا الأساسي/الويكند
    select price into override
      from public.rates r
     where r.unit_id = u.id and cur_day <@ r.d
     order by r.d desc limit 1;
    if found then
      night_price := override.price;
    elsif u.weekend_price is not null and extract(isodow from cur_day) in (5, 6) then
      night_price := u.weekend_price;     -- الجمعة/السبت
    else
      night_price := u.base_price;
    end if;
    nightly_total := nightly_total + night_price;
    cur_day := cur_day + 1;
  end loop;

  return query select n, nightly_total, u.cleaning_fee, nightly_total + u.cleaning_fee;
end;
$$;

-- =====================================================================
-- Public booking RPC (الطريق الوحيد للزوار)
-- =====================================================================

-- تنظيف pendings المنقضية (يستدعيه العامل الدوري)
create or replace function public.expire_stale_pending_bookings()
returns int language plpgsql security definer set search_path = public as $$
declare
  freed int;
begin
  with x as (
    update public.bookings b
       set status = 'expired', updated_at = now()
     where b.status = 'pending'
       and b.kind = 'booking'
       and b.expires_at is not null
       and b.expires_at < now()
    returning 1
  )
  select count(*) into freed from x;
  return freed;
end;
$$;

-- طلب حجز عام: يتحقق من النشر + أقل ليالٍ + يحسب السعر + ينشئ pending بمدة تعليق المنظمة
create or replace function public.request_booking(
  p_unit_slug text,
  p_check_in date,
  p_check_out date,
  p_guests int,
  p_guest_name text,
  p_guest_phone text,
  p_guest_email text
)
returns table (booking_id uuid, expires_at timestamptz, total numeric, nights int)
language plpgsql security definer set search_path = public as $$
declare
  u public.units;
  org_hold int;
  q record;
  b_id uuid;
  b_expires timestamptz;
begin
  select * into u from public.units where slug = p_unit_slug and is_published;
  if not found then raise exception 'UNIT_NOT_FOUND'; end if;
  if p_check_out <= p_check_in then raise exception 'INVALID_DATES'; end if;
  if p_guests < 1 or p_guests > u.capacity then raise exception 'GUESTS_EXCEEDED'; end if;
  if (p_check_out - p_check_in) < u.min_nights then raise exception 'MIN_NIGHTS'; end if;
  if p_guest_name is null or length(btrim(p_guest_name)) < 2 then raise exception 'GUEST_NAME_REQUIRED'; end if;
  if p_guest_phone is null or length(btrim(p_guest_phone)) < 9 then raise exception 'GUEST_PHONE_REQUIRED'; end if;

  select coalesce((o.settings->>'hold_hours')::int, 24) into org_hold
    from public.organizations o where o.id = u.org_id;
  org_hold := greatest(1, least(coalesce(org_hold, 24), 72));

  select * into q from public.calc_quote(u.id, p_check_in, p_check_out, p_guests);

  insert into public.bookings as bk (org_id, unit_id, kind, status, source, check_in, check_out,
                               guests, guest_name, guest_phone, guest_email, total_amount, expires_at)
  values (u.org_id, u.id, 'booking', 'pending', 'direct', p_check_in, p_check_out,
          p_guests, btrim(p_guest_name), btrim(p_guest_phone), nullif(btrim(p_guest_email), ''), q.total,
          now() + (org_hold || ' hours')::interval)
  returning bk.id, bk.expires_at into b_id, b_expires;
  -- تعارض التواريخ يفشل هنا بقيد EXCLUDE (23P01)

  return query select b_id, b_expires, q.total, q.nights;
end;
$$;

grant execute on function public.request_booking(text,date,date,int,text,text,text) to anon, authenticated;
grant execute on function public.calc_quote(uuid,date,date,int) to anon, authenticated;

-- إنشاء منظمة + عضوية مالك (onboarding) — بعد إنشاء الصف يمكن للسياسات العمل
create or replace function public.create_organization(
  p_name text,
  p_slug text,
  p_plan_id text default 'trial'
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  o_id uuid;
begin
  if auth.uid() is null then raise exception 'UNAUTHORIZED'; end if;
  if exists (select 1 from public.organizations where slug = p_slug) then
    raise exception 'SLUG_TAKEN';
  end if;
  if exists (select 1 from public.memberships m join public.org_subscriptions s on s.org_id = m.org_id
             where m.user_id = auth.uid() and s.status in ('trialing','active','past_due')) then
    raise exception 'ALREADY_HAS_ORG';
  end if;

  insert into public.organizations (name, slug) values (p_name, p_slug) returning id into o_id;
  insert into public.memberships (org_id, user_id, role) values (o_id, auth.uid(), 'org_owner');
  insert into public.org_subscriptions (org_id, plan_id, interval, status, trial_ends_at, current_period_end)
  values (o_id, p_plan_id, 'monthly', 'trialing', now() + interval '14 days', now() + interval '14 days');

  insert into public.audit_logs (org_id, actor_user_id, action, entity_type, entity_id)
  values (o_id, auth.uid(), 'org.created', 'organization', o_id);

  return o_id;
end;
$$;

grant execute on function public.create_organization(text,text,text) to authenticated;

-- =====================================================================
-- Jobs: سحب ذري بـ FOR UPDATE SKIP LOCKED (ADR 0003)
-- =====================================================================

create or replace function public.claim_jobs(p_worker text, p_limit int default 10)
returns setof public.jobs
language plpgsql security definer set search_path = public as $$
begin
  with candidate as (
    select id from public.jobs
    where status = 'pending' and run_at <= now()
    order by run_at
    limit p_limit
    for update skip locked
  )
  update public.jobs j
     set status = 'running',
         locked_at = now(),
         locked_by = p_worker,
         attempts = j.attempts + 1,
         updated_at = now()
    from candidate c
   where j.id = c.id;

  return query
    select * from public.jobs
     where locked_by = p_worker and status = 'running'
       and locked_at >= now() - interval '1 minute'
     order by run_at
     limit p_limit;
end;
$$;

-- service-role فقط: لا منح لعامة المستخدمين
revoke all on public.jobs from anon, authenticated;
revoke all on public.job_failures from anon, authenticated;
revoke all on public.rate_limits from anon, authenticated;

-- زيادة عداد النافذة ذريًا
create or replace function public.increment_rate_limit(p_key text)
returns int language plpgsql security definer set search_path = public as $$
declare
  new_count int;
begin
  update public.rate_limits
     set count = count + 1
   where key = p_key
   returning count into new_count;
  return coalesce(new_count, 1);
end;
$$;
