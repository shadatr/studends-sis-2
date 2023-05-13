import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const req = await request.json();
  console.log(req);
  const deleteReq = await supabase
    .from('tb_majors')
    .delete()
    .eq('major_name', req.item_name);
  console.log(deleteReq.error);
  return new Response(
    JSON.stringify({ message: 'تم مسح التخصص بنجاح' })
  );
}
