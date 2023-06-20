import { SectionType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data: SectionType = await request.json();


  try {
    const res = await supabase.from('tb_section').insert([data]);

     const data3 = await supabase
       .from('tb_section')
       .select('*')
       .eq('course_id', data.course_id)
       .eq('name', data.name);

     const parsedData = JSON.parse(JSON.stringify(data3));
     const messageData = parsedData.data;
     const data4: SectionType[] = messageData;
     console.log(data4);

     const data2 = { section_id: data4[0].id };
     console.log(data2);
     await supabase.from('tb_classes').insert([data2]);
     if (res.error) {
       throw res.error;
     }
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
