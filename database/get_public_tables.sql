CREATE OR REPLACE FUNCTION get_public_tables()
RETURNS TABLE(tablename NAME) AS $$
BEGIN
  RETURN QUERY SELECT t.tablename FROM pg_catalog.pg_tables t WHERE t.schemaname = 'public';
END;
$$ LANGUAGE plpgsql; 