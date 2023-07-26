import { createClient } from '@supabase/supabase-js';
import { LetterGradesType } from '@/app/types/types';
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await supabase.from('tb_grades').select('*');

    return new Response(JSON.stringify({ message: data.data }), {
      status: 200,
      headers: { revalidate: dynamic },
    });
  } catch {}
}

export async function POST(request: Request) {

  const data1 = await request.json();

  try {
    await Promise.all(
      data1.map(async (item: LetterGradesType) => {
        await supabase
          .from('tb_grades')
          .update({
            letter_grade: item.letter_grade,
            points: item.points,
          })
          .eq('course_enrollment_id', item.course_enrollment_id);

      })
    );

    return new Response(
      JSON.stringify({ message: 'تم تسجيل الامتحان بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    // send a 400 response with an error happened during registration in arabic
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل الامتحان' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}