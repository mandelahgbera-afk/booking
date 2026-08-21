-- ⚠️ DESTRUCTIVE. Wipes everything in the `public` schema (tables, functions,
-- triggers, policies — including any leftover objects from a previous
-- project on this same Supabase instance) and recreates it empty.
-- Run this FIRST, then schema.sql, then seed.sql.
-- Does NOT touch auth.users or any other schema.

drop schema public cascade;
create schema public;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
