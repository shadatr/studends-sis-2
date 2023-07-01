import { ClassesType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data: ClassesType = await request.json();

  try {
    const res = await supabase.from('tb_classes').update({"doctor_id": data.doctor_id}).eq('section_id', data.section_id);
    console.log(res.data);
    if (res.error) {
      console.log(res.error);
      throw res.error;
    }
    return new Response(JSON.stringify({ message: 'تم تعيين الدكتور بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء  تعيين الدكتور ' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
