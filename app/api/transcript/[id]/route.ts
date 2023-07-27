import { TranscriptType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

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

    return new Response(JSON.stringify({ message: data.data }), {
      status: 200,
      headers: { revalidate: dynamic },
    });
  } catch {}
}

export async function POST(request: Request) {
  const data: TranscriptType = await request.json();

  console.log(data);

  await supabase.from('tb_transcript').insert([
    {
      gpa: data.gpa,
      semester: data.semester,
      student_id: data.student_id,
      credits: data.credits,
    },
  ]);

  await supabase
    .from('tb_students')
    .update({
      semester: data.studentSemester + 1,
    })
    .eq('id', data.student_id);

  const data5 = await supabase
    .from('tb_classes')
    .update({ active: false })
    .eq('semester', data.semester);

}
