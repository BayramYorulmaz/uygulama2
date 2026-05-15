import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zewwqwzwuvppbbxiffsf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpld3dxd3p3dXZwcGJieGlmZnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MjkxMTEsImV4cCI6MjA5NDQwNTExMX0.HRq50kGG4qz6Z5GoacLAoD5QoYHaDLIMY6ZIBCyI4GM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);