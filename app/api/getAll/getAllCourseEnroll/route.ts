import { StudentClassType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data: StudentClassType = await request.json();

  try {
    await supabase.from('tb_course_enrollment').insert([data]);

    const enrollment = await supabase
      .from('tb_course_enrollment')
      .select('*')
      .eq('class_id', data.class_id)
      .eq('student_id', data.student_id);

    const course = enrollment.data;

    if (course) {
      const data2 = {
        course_enrollment_id: course[0].id,
      };
      const res = await supabase.from('tb_grades').insert([data2]);
      console.log(res);
    }

    return new Response(JSON.stringify({ message: 'تم ارسال المواد بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء ارسال المواد' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
