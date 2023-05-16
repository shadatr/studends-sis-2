
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/app/types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);


export async function POST(request: Request) {
  const req = await request.json();
  console.log(req);
  try{
  const deleteReq = await supabase
    .from('tb_courses')
    .delete()
    .eq('id', req.item_name);
  console.log(deleteReq.error?.message);
  return new Response(JSON.stringify({ message: 'تم مسح التخصص بنجاح' }));}
  catch{}
}
