import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function GET() {
  try {
    const data = await supabase.from('tb_course_enrollment').select('*');

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}

export async function POST(request: Request) {
  const data = await request.json();

  try {
      await supabase
        .from('tb_course_enrollment')
        .update({ approved: data.course.approved })
        .eq('id', data.course.id);

      await supabase
        .from('tb_section')
        .update({ students_num: data.course.students_num })
        .eq('id', data.course.section_id);

      await supabase.from('tb_grades').insert([data.grade]);


    return new Response(JSON.stringify({ message: 'تم الموافقة على المواد بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء الموافقة على المواد' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
