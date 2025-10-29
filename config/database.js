import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_ANON_KEY deben estar definidos');
  console.error('SUPABASE_URL:', supabaseUrl ? '✅ Definido' : '❌ No definido');
  console.error('SUPABASE_ANON_KEY:', supabaseKey ? '✅ Definido' : '❌ No definido');
  throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY deben estar definidos en las variables de entorno');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
