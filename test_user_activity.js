// Test script to check user_activity table structure and test insert
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUserActivity() {
  try {
    // First, let's check the table structure
    console.log('Checking user_activity table structure...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_activity')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Error accessing user_activity table:', tableError);
      return;
    }
    
    console.log('Table structure sample:', tableInfo);
    
    // Test insert with minimal data
    console.log('Testing insert with minimal data...');
    const { data: insertData, error: insertError } = await supabase
      .from('user_activity')
      .insert([
        {
          user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
          activity_type: 'test',
          description: 'Test activity from script',
        }
      ])
      .select();
    
    if (insertError) {
      console.error('Insert error:', insertError);
    } else {
      console.log('Insert successful:', insertData);
    }
    
  } catch (error) {
    console.error('Exception:', error);
  }
}

testUserActivity(); 