import { SectionType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data: SectionType = await request.json();


  try {
     await supabase.from('tb_section').insert([data]);

    return new Response(JSON.stringify({ message: 'تم تسجيل المجموعة بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل المجموعة' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
