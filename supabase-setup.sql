-- Run in Supabase SQL Editor (for existing `purchases` table created earlier)

-- Ensure columns exist (safe if already created)
alter table public.purchases add column if not exists email text;
alter table public.purchases add column if not exists status text default 'Active';
alter table public.purchases add column if not exists plan text;
alter table public.purchases add column if not exists company_name text;
alter table public.purchases add column if not exists valid_till date;

-- Keep RLS enabled
alter table public.purchases enable row level security;

-- Allow a logged-in customer to READ only their own purchase record(s) by email
-- (Match is case-insensitive. Make sure purchases.email is the same email used for login.)
drop policy if exists "customers can read own purchases" on public.purchases;
create policy "customers can read own purchases"
on public.purchases
for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));

-- No insert/update/delete policy for authenticated users => customers cannot edit/add/delete.
-- You (admin) can still manage records from Supabase Dashboard.

-- OPTIONAL: if you want to also allow access by auth user id, add a column and policy instead:
-- alter table public.purchases add column if not exists user_id uuid references auth.users(id);
-- create policy "customers read own by user_id" on public.purchases for select to authenticated using (user_id = auth.uid());

-- Create/login users for customers:
-- Supabase Dashboard -> Authentication -> Users -> Add user
-- Use the SAME email as in purchases.email and set a password for them.
-- (Or enable email OTP/magic link in Auth settings and adjust website login accordingly.)