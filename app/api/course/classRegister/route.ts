import { ClassesType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const data: ClassesType = await request.json();

  try {
    const res = await supabase.from('tb_classes').insert([data]);
    console.log(res.error?.message);
    
    return new Response(JSON.stringify({ message: 'تم تسجيل المحاضرة بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل المحاضرة' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
