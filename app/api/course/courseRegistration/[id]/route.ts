import { AddCourseType, SectionType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data: AddCourseType = await request.json();

  try {
    const res = await supabase.from('tb_courses').insert([data]);

    const data3 = await supabase
      .from('tb_courses')
      .select('*')
      .eq('major_id', data.major_id)
      .eq('course_name', data.course_name);

      const parsedData = JSON.parse(JSON.stringify(data3));
      const messageData = parsedData.data;
      const data4: AddCourseType[] = messageData;
      console.log(data4);


    const data2: SectionType =  {name: data.course_name+'(S1)', course_id: data4[0].id};
    console.log(data2);
    await supabase.from('tb_section').insert([data2]);
    if (res.error) {
      throw res.error;
    }
    return new Response(JSON.stringify({ message: 'تم تسجيل المادة بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل المادة' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const data = await supabase
      .from('tb_courses')
      .select('*')
      .eq('major_id', params.id);

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}
