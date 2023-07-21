import { AddCourseType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data: AddCourseType = await request.json();
  
  try {
    await supabase.from('tb_courses').insert([data]);
    const course= await supabase
      .from('tb_courses')
      .select('*').eq("course_name",data.course_name);

      if (course.data && course.data.length > 0) {
        const res = course.data[0];
        const data2 = {
          name: res.course_name + `(مجموعة1)`,
          course_id: res.id,
        };
        await supabase.from('tb_section').insert([data2]);
      } else {
        return new Response(
          JSON.stringify({ message: 'حدث خطأ اثناء تسجيل المادة' }),
          { headers: { 'content-type': 'application/json' }, status: 400 }
        );
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

export async function GET() {
  try {
    const data = await supabase
      .from('tb_courses')
      .select('*');

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}
