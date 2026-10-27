-- Đã chạy trên Supabase: cho phép đăng tin mà admin xác nhận "không trùng" dù trùng địa chỉ + diện tích.
alter table public.properties add column if not exists dup_forced boolean;
drop index if exists public.uq_address_area_type;
create unique index uq_address_area_type on public.properties (address, area_ping, coalesce(area_land_ping, 0::numeric), listing_type) where not coalesce(dup_forced, false);
