-- Tiện ích xung quanh (生活機能) lấy từ 永慶 cho trang chi tiết nhà bán.
-- Chạy 1 lần trong Supabase → SQL Editor. An toàn khi chạy lại (idempotent).

create table if not exists property_pois (
  property_id text primary key,
  yc_id text,
  center_lat numeric,
  center_lng numeric,
  categories jsonb not null default '[]'::jsonb,
  fetched_at timestamptz not null default now()
);
alter table property_pois enable row level security;
drop policy if exists property_pois_public_read on property_pois;
create policy property_pois_public_read on property_pois for select using (true);

-- Tin 永慶 đã đăng nhưng chưa có (hoặc đã quá 60 ngày) dữ liệu tiện ích xung quanh
create or replace function import_poi_candidates(p_password text, p_limit int default 30)
returns table(property_id text, source_url text)
language plpgsql security definer set search_path = public as $$
begin
  if not import_auth(p_password) then raise exception 'invalid_password'; end if;
  return query
    select q.property_id, q.source_url
    from listing_import_queue q
    join properties p on p.id = q.property_id and p.status = 'active'
    left join property_pois pp on pp.property_id = q.property_id
    where q.status = 'published'
      and q.source_url like 'https://buy.yungching.com.tw/house/%'
      and (pp.property_id is null or pp.fetched_at < now() - interval '60 days')
    order by (pp.property_id is null) desc, pp.fetched_at nulls first
    limit greatest(1, least(p_limit, 100));
end $$;

create or replace function import_poi_upsert(p_password text, p_property_id text, p_data jsonb)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not import_auth(p_password) then raise exception 'invalid_password'; end if;
  if not exists (select 1 from properties where id = p_property_id) then return false; end if;
  insert into property_pois (property_id, yc_id, center_lat, center_lng, categories, fetched_at)
  values (p_property_id, p_data->>'yc_id',
          nullif(p_data->'center'->>'lat','')::numeric, nullif(p_data->'center'->>'lng','')::numeric,
          coalesce(p_data->'categories','[]'::jsonb), now())
  on conflict (property_id) do update
    set yc_id = excluded.yc_id, center_lat = excluded.center_lat, center_lng = excluded.center_lng,
        categories = excluded.categories, fetched_at = now();
  return true;
end $$;

revoke all on function import_poi_candidates(text,int) from public;
revoke all on function import_poi_upsert(text,text,jsonb) from public;
grant execute on function import_poi_candidates(text,int) to anon, authenticated;
grant execute on function import_poi_upsert(text,text,jsonb) to anon, authenticated;
