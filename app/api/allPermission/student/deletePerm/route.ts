import { createClient } from '@supabase/supabase-js';
import { Database } from '@/app/types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const req = await request.json();
  console.log(req);
  try {
    const deleteReq = await supabase
      .from('tb_student_perms')
      .delete()
      .eq('permission_id', req.permission_id)
      .eq('student_id', req.student_id);
       console.log(deleteReq.error?.message);
    return new Response(JSON.stringify({ message: 'تم مسح الصلاحية بنجاح' }));
  } catch {}
}

