import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('customers').insert([{
    id: `CUST-${Date.now()}`,
    name: "Test",
    email: "test@test.com",
    phone: "123",
    password: "123",
    createdAt: new Date().toISOString()
  }]).select();
  console.log("Error:", error);
  console.log("Data:", data);
}

test();
