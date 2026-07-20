alter table if exists public.platform_company_subscriptions
  add column if not exists max_users integer;

alter table if exists public.platform_company_subscriptions
  drop constraint if exists platform_company_subscriptions_max_users_check;

alter table if exists public.platform_company_subscriptions
  add constraint platform_company_subscriptions_max_users_check
  check (max_users is null or max_users >= 0);

create table if not exists public.platform_client_registration_requests (
  id uuid primary key default gen_random_uuid(),
  clinic_name text not null,
  document_cnpj text,
  clinic_type text,
  phone text,
  email text,
  address text,
  city text,
  state text,
  zip_code text,
  website_or_instagram text,
  responsible_name text not null,
  responsible_document text,
  responsible_email text not null,
  responsible_phone text,
  responsible_role text,
  desired_admin_name text,
  desired_admin_email text,
  interested_plan text,
  estimated_users integer,
  estimated_professionals integer,
  wants_white_label boolean not null default false,
  source text,
  source_campaign text,
  notes text,
  status text not null default 'pending',
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  approved_company_id uuid references public.companies(id) on delete set null,
  approved_platform_company_id uuid references public.platform_companies(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_client_registration_requests_status_check check (
    status in ('pending', 'in_review', 'approved', 'rejected', 'need_more_info', 'converted')
  ),
  constraint platform_client_registration_requests_estimated_users_check check (
    estimated_users is null or estimated_users >= 0
  ),
  constraint platform_client_registration_requests_estimated_professionals_check check (
    estimated_professionals is null or estimated_professionals >= 0
  )
);

create index if not exists platform_client_registration_requests_status_idx
  on public.platform_client_registration_requests (status);

create index if not exists platform_client_registration_requests_created_at_idx
  on public.platform_client_registration_requests (created_at desc);

create index if not exists platform_client_registration_requests_email_idx
  on public.platform_client_registration_requests (responsible_email);

create or replace function public.set_platform_client_registration_requests_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_platform_client_registration_requests_updated_at
  on public.platform_client_registration_requests;

create trigger set_platform_client_registration_requests_updated_at
before update on public.platform_client_registration_requests
for each row
execute function public.set_platform_client_registration_requests_updated_at();

alter table public.platform_client_registration_requests enable row level security;

grant insert on public.platform_client_registration_requests to anon;
grant select, update on public.platform_client_registration_requests to authenticated;
grant select, insert, update on public.companies to authenticated;
grant select, insert, update on public.company_settings to authenticated;

drop policy if exists "platform admins manage clinic companies"
  on public.companies;

create policy "platform admins manage clinic companies"
on public.companies
for all
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

drop policy if exists "platform admins manage clinic company settings"
  on public.company_settings;

create policy "platform admins manage clinic company settings"
on public.company_settings
for all
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

drop policy if exists "Public can submit client registration requests"
  on public.platform_client_registration_requests;

create policy "Public can submit client registration requests"
on public.platform_client_registration_requests
for insert
to anon
with check (
  status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
  and approved_company_id is null
  and approved_platform_company_id is null
);

drop policy if exists "Platform admins can read client registration requests"
  on public.platform_client_registration_requests;

create policy "Platform admins can read client registration requests"
on public.platform_client_registration_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.platform_admin_users admin_user
    where admin_user.user_id = (select auth.uid())
      and admin_user.active = true
      and admin_user.role in ('owner', 'admin', 'support', 'commercial')
  )
);

drop policy if exists "Platform admins can update client registration requests"
  on public.platform_client_registration_requests;

create policy "Platform admins can update client registration requests"
on public.platform_client_registration_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.platform_admin_users admin_user
    where admin_user.user_id = (select auth.uid())
      and admin_user.active = true
      and admin_user.role in ('owner', 'admin', 'support', 'commercial')
  )
)
with check (
  exists (
    select 1
    from public.platform_admin_users admin_user
    where admin_user.user_id = (select auth.uid())
      and admin_user.active = true
      and admin_user.role in ('owner', 'admin', 'support', 'commercial')
  )
);
