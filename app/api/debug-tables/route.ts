import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase client using the same credentials as the rest of the app
const supabase = createClient(
  "https://tnptwkmxylriukggyjyl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRucHR3a214eWxyaXVrZ2d5anlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyNTAwNywiZXhwIjoyMDY1OTAxMDA3fQ.PnXJghuoEXbqRUU8KIKBGqqnFOdwo0DGxsWdADVj3-8"
);

export async function GET() {
  try {
    // This query directly accesses the PostgreSQL system catalog.
    // It does not rely on any custom functions and is a more reliable test.
    const { data, error } = await supabase.rpc('get_public_tables');

    if (error) {
      throw error;
    }

    const tableNames = data.map((table: any) => table.tablename);

    return NextResponse.json({
      success: true,
      message: "Directly fetched table list from pg_tables.",
      tables: tableNames,
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch tables from pg_tables.",
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}

// Note: You may need to create the 'get_public_tables' function in your Supabase SQL Editor
// if it doesn't exist. Here is the SQL to create it:
/*
  CREATE OR REPLACE FUNCTION get_public_tables()
  RETURNS TABLE(tablename NAME) AS $$
  BEGIN
    RETURN QUERY SELECT t.tablename FROM pg_tables t WHERE t.schemaname = 'public';
  END;
  $$ LANGUAGE plpgsql;
*/ 