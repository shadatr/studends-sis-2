import { createClient } from '@supabase/supabase-js';
import { Database } from '@/app/types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const req = await request.json();

  try {
    const deleteReq = await supabase
      .from('tb_admin_perms')
      .delete()
      .eq('permission_id', req.item_per_id)
      .eq('admin_id', req.item_admin_id);
       console.log(deleteReq.error?.message);
    return new Response(JSON.stringify({ message: 'تم مسح التخصص بنجاح' }));
  } catch {}
}

