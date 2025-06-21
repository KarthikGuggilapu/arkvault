import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase client using the same credentials as the rest of the app
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // This query asks the database directly for a list of all tables in the 'public' schema
    const { data, error } = await supabase.rpc('get_public_tables');

    if (error) {
      throw error;
    }

    const tableNames = data.map((table: any) => table.tablename);

    return NextResponse.json({
      success: true,
      message: "Successfully fetched table list.",
      tables: tableNames,
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch tables.",
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