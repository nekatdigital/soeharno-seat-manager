-- Restaurant Management Schema (PostgreSQL / Supabase compatible)
-- Safe to run multiple times

begin;

create extension if not exists pgcrypto; -- for gen_random_uuid()

-- enums
create type if not exists table_status as enum ('empty','occupied','reserved');

-- tables
create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  role_id uuid references roles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists dining_tables (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  capacity int not null default 4,
  status table_status not null default 'empty',
  customer_name text,
  occupied_since timetz,
  reservation_time timetz,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(12,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid references dining_tables(id) on delete set null,
  user_id uuid references app_users(id) on delete set null,
  status text not null default 'open', -- open, paid, void
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  quantity int not null default 1,
  price numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  method text not null, -- cash, card, ewallet
  amount numeric(12,2) not null,
  paid_at timestamptz not null default now()
);

create view if not exists order_totals as
select 
  o.id as order_id,
  coalesce(sum(oi.quantity * oi.price),0)::numeric(12,2) as total
from orders o
left join order_items oi on oi.order_id = o.id
group by o.id;

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor uuid references app_users(id),
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

-- indexes
create index if not exists idx_menu_items_category on menu_items(category_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_orders_table on orders(table_id);

-- seed minimal roles
insert into roles (id, name)
select gen_random_uuid(), v.name
from (values ('owner'), ('staff')) as v(name)
where not exists (select 1 from roles r where r.name = v.name);

commit;
