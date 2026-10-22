-- import_publish: khi insert vướng unique index uq_address_area_type (cùng địa chỉ + diện tích + loại tin,
-- kể cả với tin đã bán/gỡ) thì KHÔNG ném lỗi nữa mà đánh dấu 'duplicate' kèm mã tin đang trùng.
CREATE OR REPLACE FUNCTION public.import_publish(p_password text, p_id bigint)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare q listing_import_queue; pid text; rec properties; dupmsg text;
begin
  if not import_auth(p_password) then raise exception 'invalid_password'; end if;
  select * into q from listing_import_queue where id = p_id for update;
  if q.id is null then raise exception 'not_found'; end if;
  if q.status = 'published' then return q.property_id; end if;
  if jsonb_array_length(q.images) = 0 then raise exception 'no_images'; end if;
  pid := q.draft->>'id';
  if pid is null or pid = '' then raise exception 'missing_id'; end if;
  if exists (select 1 from properties where id = pid) then
    update listing_import_queue set status = 'duplicate', property_id = pid, error = 'Trùng mã tin đã đăng: ' || pid where id = p_id;
    return null;
  end if;
  -- Kiểm tra trùng nhà với tin đã đăng (trừ khi admin đã xác nhận "không trùng")
  if not coalesce((q.draft->>'dup_ok')::boolean, false) then
    select string_agg(c.ref_id || ' (' || coalesce(c.title,'') || ')', ', ') into dupmsg
      from import_dup_candidates(p_password, q.draft, q.id) c where c.kind = 'property';
    if dupmsg is not null then
      update listing_import_queue set status = 'duplicate', error = 'Trùng với tin đã đăng: ' || dupmsg where id = p_id;
      return null;
    end if;
  end if;
  rec := jsonb_populate_record(null::properties,
           q.draft || jsonb_build_object('images', q.images, 'posted_at', now(), 'views', 0, 'status', 'active'));
  rec.bedrooms := coalesce(rec.bedrooms, 1); rec.bathrooms := coalesce(rec.bathrooms, 1);
  rec.floor := coalesce(rec.floor, '1'); rec.total_floors := coalesce(rec.total_floors, 1);
  rec.age := coalesce(rec.age, 0); rec.facing := coalesce(rec.facing, '南');
  rec.features := coalesce(rec.features, '[]'::jsonb); rec.features_vi := coalesce(rec.features_vi, '[]'::jsonb);
  rec.agent_name := coalesce(rec.agent_name, ''); rec.agent_phone := coalesce(rec.agent_phone, '');
  rec.agent_line := coalesce(rec.agent_line, ''); rec.is_new := coalesce(rec.is_new, true);
  rec.is_featured := coalesce(rec.is_featured, false); rec.parking := coalesce(rec.parking, false);
  rec.lat := coalesce(rec.lat, 24.1477); rec.lng := coalesce(rec.lng, 120.6736);
  rec.nearby := coalesce(rec.nearby, '{}'::jsonb); rec.agent_is_professional := coalesce(rec.agent_is_professional, true);
  begin
    insert into properties select rec.*;
  exception when unique_violation then
    select id || ' (' || coalesce(status, 'active') || ')' into dupmsg
      from properties
     where address = rec.address and area_ping = rec.area_ping
       and coalesce(area_land_ping, 0) = coalesce(rec.area_land_ping, 0) and listing_type = rec.listing_type
     limit 1;
    update listing_import_queue
       set status = 'duplicate',
           error = 'Trùng nhà đã có trên web (cùng địa chỉ + diện tích): ' || coalesce(dupmsg, '?')
     where id = p_id;
    return null;
  end;
  update listing_import_queue set status = 'published', property_id = pid, published_at = now(), error = null where id = p_id;
  return pid;
end $function$;
