
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);


export async function POST(request: Request) {
  const req = await request.json();
  
  try{
  const deleteReq = await supabase
    .from('tb_courses')
    .update({active: req.active})
    .eq('id', req.id);
    console.log(deleteReq.data);
  console.log(deleteReq.error?.message);
  return new Response(JSON.stringify({ message: 'تم تغيير حالة المادة بنجاح' }));}
  catch{}
}
