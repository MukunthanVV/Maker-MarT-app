import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function mergeChats() {
  const { data: chats, error } = await supabase.from('chats').select('*');
  if (error) {
    console.error('Error fetching chats:', error);
    return;
  }

  // Group by user pairs
  const pairs = {};
  for (const chat of chats) {
    const minId = chat.buyer_id < chat.seller_id ? chat.buyer_id : chat.seller_id;
    const maxId = chat.buyer_id > chat.seller_id ? chat.buyer_id : chat.seller_id;
    const pairKey = `${minId}_${maxId}`;
    if (!pairs[pairKey]) pairs[pairKey] = [];
    pairs[pairKey].push(chat);
  }

  for (const [key, pairChats] of Object.entries(pairs)) {
    if (pairChats.length > 1) {
      console.log(`Pair ${key} has ${pairChats.length} chats. Merging...`);
      // Sort by created_at ascending so we keep the oldest chat
      pairChats.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const keptChat = pairChats[0];
      const duplicateChats = pairChats.slice(1);

      for (const dup of duplicateChats) {
        // Move messages to keptChat
        const { error: updateError } = await supabase
          .from('messages')
          .update({ chat_id: keptChat.id })
          .eq('chat_id', dup.id);
        
        if (updateError) {
          console.error(`Error updating messages for chat ${dup.id}:`, updateError);
        } else {
          console.log(`Moved messages from ${dup.id} to ${keptChat.id}`);
          // Delete duplicate chat
          const { error: delError } = await supabase
            .from('chats')
            .delete()
            .eq('id', dup.id);
          if (delError) {
             console.error(`Error deleting chat ${dup.id}:`, delError);
          } else {
             console.log(`Deleted chat ${dup.id}`);
          }
        }
      }
    }
  }
  console.log('Merge complete.');
}

mergeChats();
