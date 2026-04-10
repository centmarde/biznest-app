-- Fix: PostGIS function resolution inside hazard trigger.
--
-- Root cause:
-- `set search_path = public` prevents unqualified `st_geometrytype(...)`
-- from resolving when PostGIS lives under the `extensions` schema.
--
-- Run this in Supabase SQL Editor.

    create or replace function public.handle_hazard_geometry_type()
    returns trigger
    language plpgsql
    security definer
    set search_path = public, extensions
    as $$
    begin
      new.geometry_type := case lower(extensions.st_geometrytype(new.geometry))
        when 'st_point' then 'point'::public.hazard_geometry_type
        when 'st_linestring' then 'linestring'::public.hazard_geometry_type
        when 'st_polygon' then 'polygon'::public.hazard_geometry_type
        else new.geometry_type
      end;

      return new;
    end;
    $$;

