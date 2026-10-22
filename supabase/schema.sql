-- Space Coffee and Matcha: schema + RLS
-- Run once in Supabase SQL Editor (before seed.sql)

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  sort_order int default 0
);

-- price = REG price, price_large = LRG price (null = single size product)
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id),
  name text not null,
  description text,
  price int not null check (price >= 0),
  price_large int check (price_large is null or price_large >= 0),
  image_url text,
  is_available boolean default true,
  is_best_seller boolean default false,
  stock_note text,
  created_at timestamptz default now()
);

create table toppings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price int not null check (price >= 0),
  is_available boolean default true
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  customer_name text not null,
  customer_phone text,
  table_no text,
  note text,
  total int not null,
  status text not null default 'pending_payment',
  -- pending_payment | paid | preparing | ready | completed | cancelled | expired
  payment_method text,
  payment_ref text,
  paid_at timestamptz,
  is_dummy boolean default false,
  consent_at timestamptz,
  created_at timestamptz default now()
);

-- price = FINAL unit price (size + toppings), recalculated by the server from DB
-- toppings = snapshot [{ "id": "...", "name": "Milo", "price": 4000 }]
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  name text not null,
  size text check (size in ('REG','LRG')),
  toppings jsonb not null default '[]',
  price int not null,
  qty int not null check (qty > 0),
  note text
);

-- key: hero, promo, about, opening_hours, contact, social
create table site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int default 0
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table page_views (
  id bigserial primary key,
  path text not null,
  created_at timestamptz default now()
);

create table admin_profiles (
  id uuid primary key references auth.users(id),
  name text,
  role text check (role in ('owner','cashier','barista'))
);

alter publication supabase_realtime add table orders;

-- Row Level Security
alter table categories enable row level security;
alter table products enable row level security;
alter table toppings enable row level security;
alter table site_content enable row level security;
alter table faqs enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table page_views enable row level security;
alter table admin_profiles enable row level security;

-- Public read only. Writes go through API routes using the service role
-- (the service role bypasses RLS, so no write policies are needed).
create policy "Public read categories" on categories
  for select to anon, authenticated using (true);
create policy "Public read products" on products
  for select to anon, authenticated using (true);
create policy "Public read toppings" on toppings
  for select to anon, authenticated using (true);
create policy "Public read site_content" on site_content
  for select to anon, authenticated using (true);
create policy "Public read faqs" on faqs
  for select to anon, authenticated using (true);

-- orders, order_items, reviews, page_views, admin_profiles: RLS on, no public policy.
-- Realtime policy for orders is added in P9.