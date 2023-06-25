import { TranscriptType } from '@/app/types/types';
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
      .from('tb_transcript')
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
  const data: TranscriptType = await request.json();

    const data1=await supabase.from('tb_transcript').insert([data]);

    const data2 = await supabase
      .from('tb_students')
      .update({
        semester: data.semester+1,
      })
      .eq('id', data.student_id);

      const data3 = await supabase
        .from('tb_course_enrollment')
        .update({
          active: false,
        })
        .eq('student_id', data.student_id);

      console.log(data1.error?.message);
      console.log(data2.error?.message);
      console.log(data3.error?.message);
}