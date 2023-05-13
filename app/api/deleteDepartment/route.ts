import { createClient } from '@supabase/supabase-js';
import { AnnouncmentsMangType } from '@/app/types';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request : Request) {
  const req = await request.json();
  console.log(req);
  const deleteReq = await supabase.from("tb_departments").delete().eq("name" , req.item_name);
  console.log(deleteReq.error);
  return new Response(JSON.stringify({message : "announcement was deleted sucessfully"}));
}