-- Ventas y gastos compartidos entre las usuarias del equipo.
-- Correr una sola vez en Supabase → SQL Editor, DESPUÉS de crear la cuenta de Karina
-- (Authentication → Users → Add user, correo karina@mirakel.app, Auto Confirm User).

create table if not exists equipo (
  user_id uuid primary key references auth.users on delete cascade
);
alter table equipo enable row level security;
create policy "Cada usuaria ve su registro" on equipo for select
  using (user_id = auth.uid());

-- Dueña actual: quien ya tiene ventas o gastos guardados.
insert into equipo (user_id)
  select owner from ventas union select owner from gastos
  on conflict do nothing;
-- Karina.
insert into equipo (user_id)
  select id from auth.users where email = 'karina@mirakel.app'
  on conflict do nothing;

drop policy if exists "Solo la duena" on ventas;
drop policy if exists "Solo la duena" on gastos;
create policy "Equipo MiraKel" on ventas for all
  using (exists (select 1 from equipo where user_id = auth.uid()))
  with check (exists (select 1 from equipo where user_id = auth.uid()));
create policy "Equipo MiraKel" on gastos for all
  using (exists (select 1 from equipo where user_id = auth.uid()))
  with check (exists (select 1 from equipo where user_id = auth.uid()));

-- Para agregar otra usuaria más adelante: crea su cuenta como usuario@mirakel.app y corre
-- insert into equipo (user_id) select id from auth.users where email = 'usuario@mirakel.app';
