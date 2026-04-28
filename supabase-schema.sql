-- Tasnim Power Engineering - Supabase Schema
-- Run this in your Supabase SQL Editor

-- 1. Create products table
create table products (
  id text primary key,
  name text not null,
  category text not null,
  "priceValue" numeric not null,
  image text,
  description text,
  features jsonb not null default '[]'::jsonb,
  warranty text,
  stock integer,
  discount numeric,
  reviews jsonb,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create customers table
create table customers (
  id text primary key,
  name text not null,
  email text not null,
  phone text not null,
  password text not null,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create orders table
create table orders (
  id text primary key,
  "customerId" text references customers(id),
  "customerName" text not null,
  phone text not null,
  address text not null,
  items jsonb not null,
  total numeric not null,
  status text not null default 'Pending',
  "deliveryCharge" numeric not null default 0,
  "paymentMethod" text,
  "transactionId" text,
  date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create configuration settings table
create table settings (
  key text primary key,
  value jsonb not null
);

-- Insert Default Settings
insert into settings (key, value) values
('company_name', '"Tasnim Power Engineering"'),
('whatsapp_number', '""'),
('payment_phone', '"01619184281"'),
('delivery_settings', '[
  { "id": "1", "label": "Inside Dhaka", "amount": 80 },
  { "id": "2", "label": "Outside Dhaka", "amount": 150 }
]'),
('categories', '[
  { "id": "1", "name": "Solar Systems" },
  { "id": "2", "name": "Energy Storage" },
  { "id": "3", "name": "Lift Parts" },
  { "id": "4", "name": "Substation & Transformer" },
  { "id": "5", "name": "Circuit Breaker" },
  { "id": "6", "name": "Cables & Accessories" }
]')
on conflict (key) do nothing;

-- 6. Setup Row Level Security (RLS) policies
-- Allow completely public access for all operations since it's a minimal setup with anon keys used loosely on frontend.
-- In a real production scenario, you would lock this down considerably and use authentication.

alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table settings enable row level security;

-- Public read access for products and settings
create policy "Public read access for products" on products for select using (true);
create policy "Public read access for settings" on settings for select using (true);

-- Public read/write/update access for everything (Admin panel runs on frontend and needs access)
create policy "Public write access for products" on products for insert with check (true);
create policy "Public update access for products" on products for update using (true);
create policy "Public delete access for products" on products for delete using (true);

create policy "Public all access for customers" on customers for all using (true);
create policy "Public all access for orders" on orders for all using (true);
create policy "Public all access for settings" on settings for all using (true);
