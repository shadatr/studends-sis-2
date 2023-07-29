import { createClient } from '@supabase/supabase-js';
import { MajorType } from '@/app/types/types';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(
  request: Request,
) {

  const newData: MajorType[] = await request.json();


  try {
    newData.map(async (data) => {
      const res=await supabase.from('tb_majors').update([data]).eq('id', data.id);
      console.log(data);
      console.log(res);
    });

    return new Response(
      JSON.stringify({ message: 'تم تحديث البيانات بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    // send a 400 response with an error happened during update in Arabic
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تحديث البيانات' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
