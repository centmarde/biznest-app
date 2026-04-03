-- update_user_metadata_rpc
CREATE OR REPLACE FUNCTION update_user_metadata_rpc(target_user_id UUID, meta_updates JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || meta_updates
  WHERE id = target_user_id;
END;
$$;

-- delete_user_rpc
CREATE OR REPLACE FUNCTION delete_user_rpc(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users
  WHERE id = target_user_id;
END;
$$;
