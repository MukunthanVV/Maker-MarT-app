import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      id,
      messages ( content, created_at )
    `)
    .eq('id', 'd0112284-b967-4bc0-b4a9-510daf166eed');
  console.log(JSON.stringify(data, null, 2));
  console.log('Error:', error);
}

test();
