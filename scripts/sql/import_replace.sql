-- import_replace: đăng tin mới THAY THẾ tin cũ cùng địa chỉ + diện tích.
-- Tin cũ không bị xoá: chuyển sang status 'removed' và đổi địa chỉ thêm hậu tố (để nhả unique index
-- uq_address_area_type), tin mới được đăng bằng import_publish. Lỗi ở bước nào thì toàn bộ được hoàn tác.
CREATE OR REPLACE FUNCTION public.import_replace(p_password text, p_id bigint)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare q listing_import_queue; oldid text; newid text;
begin
  if not import_auth(p_password) then raise exception 'invalid_password'; end if;
  select * into q from listing_import_queue where id = p_id for update;
  if q.id is null then raise exception 'not_found'; end if;

  select id into oldid from properties
   where address = q.draft->>'address'
     and area_ping = (q.draft->>'area_ping')::numeric
     and coalesce(area_land_ping, 0) = coalesce((q.draft->>'area_land_ping')::numeric, 0)
     and listing_type = coalesce(q.draft->>'listing_type', 'buy')
     and id <> coalesce(q.draft->>'id', '')
   order by (status = 'active') desc, posted_at desc
   limit 1;

  if oldid is not null then
    update properties
       set status = 'removed',
           address = address || ' [đã thay thế bằng ' || coalesce(q.draft->>'id', '?') || ' - ' || id || ']'
     where id = oldid;
  end if;

  -- bỏ qua bước kiểm tra "trùng" vì admin đã chủ động chọn thay thế
  update listing_import_queue
     set draft = draft || '{"dup_ok": true}'::jsonb, status = 'ready', error = null
   where id = p_id;

  newid := import_publish(p_password, p_id);
  if newid is null then raise exception 'replace_failed'; end if;
  return newid;
end $function$;
