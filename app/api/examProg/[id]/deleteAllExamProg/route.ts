import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST() {

  const deleteReq = await supabase.from('tb_exam_program').delete().gte('id', 0);
  console.log(deleteReq.error);
  
  return new Response(JSON.stringify({ message: 'تم حذف الامتحان بنجاح' }));
}
