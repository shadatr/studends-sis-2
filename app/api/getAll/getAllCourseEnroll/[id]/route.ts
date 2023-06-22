import { StudentClassType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const data = await supabase
      .from('tb_course_enrollment')
      .select('*')
      .eq('student_id', params.id);

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}


export async function POST(request: Request) {
  const data: StudentClassType = await request.json();

  try {
    const res = await supabase.from('tb_course_enrollment').insert([data]);
    console.log(res.error?.message);
    if (res.error) {
      console.log(res.error);
      throw res.error;
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
