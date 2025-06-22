// This is a direct, low-level test to diagnose the database connection issue.
// To run: node database_connection_test.js

require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://tnptwkmxylriukggyjyl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRucHR3a214eWxyaXVrZ2d5anlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyNTAwNywiZXhwIjoyMDY1OTAxMDA3fQ.PnXJghuoEXbqRUU8KIKBGqqnFOdwo0DGxsWdADVj3-8";

console.log("--- Supabase Connection Test ---");

if (!supabaseUrl || !supabaseKey) {
  console.error("ERROR: Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

console.log("Connecting with URL:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("\nStep 1: Fetching all tables from the 'public' schema...");
  
  try {
    const { data: tables, error: tablesError } = await supabase.rpc('get_public_tables');

    if (tablesError) {
      console.error("\n--- FAILED to fetch table list ---");
      throw tablesError;
    }

    console.log("\n--- SUCCESS: Found the following tables ---");
    const tableNames = tables.map(t => t.tablename);
    console.log(tableNames);
    console.log("------------------------------------------");

    const hasSharedPasswords = tableNames.includes('shared_passwords');
    if (!hasSharedPasswords) {
      console.error("\nCRITICAL ERROR: The table 'shared_passwords' was NOT FOUND in the list.");
      console.error("This confirms the application cannot see the table.");
      return;
    }

    console.log("\nStep 2: Attempting to select from 'passwords' (a known working table)...");

    const { data: passwordData, error: passwordError } = await supabase
      .from('passwords')
      .select('id')
      .limit(1);

    if (passwordError) {
      console.error("\n--- FAILED to select from 'passwords' ---");
      console.error("CRITICAL ERROR: The test failed on a table that should be working.");
      console.error("This confirms the credentials in .env.local are pointing to the wrong database.");
      throw passwordError;
    }

    console.log("\n--- SUCCESS: Successfully selected from 'passwords' ---");
    console.log("This is highly unusual. The connection works for 'passwords' but not for system tables or 'shared_passwords'.");

    console.log("\nStep 3: Attempting to select from 'shared_passwords'...");

    const { data: sharedData, error: selectError } = await supabase
      .from('shared_passwords')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error("\n--- FAILED to select from 'shared_passwords' ---");
      throw selectError;
    }

    console.log("\n--- SUCCESS: Successfully selected from 'shared_passwords' ---");
    console.log("Test record:", sharedData);
    console.log("----------------------------------------------------------");
    console.log("\nCONCLUSION: The connection and permissions appear to be correct. The issue is likely within the Next.js environment or Supabase API cache.");

  } catch (error) {
    console.error("\n--- TEST FAILED ---");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    console.error("-------------------");
    console.log("\nCONCLUSION: There is a fundamental problem with the database connection or permissions for the provided credentials.");
  }
}

runTest(); 