import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tnptwkmxylriukggyjyl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRucHR3a214eWxyaXVrZ2d5anlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjUwMDcsImV4cCI6MjA2NTkwMTAwN30.dwwrRFM4DZEawJfS-3eigrOqNBUTbqowde9558f4RzU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 