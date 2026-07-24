import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function countChats() {
  const { data: chats, error } = await supabase.from('chats').select('*');
  console.log('Total chats:', chats.length);
  for (const chat of chats) {
    console.log(chat.id, chat.buyer_id, chat.seller_id);
  }
}

countChats();
