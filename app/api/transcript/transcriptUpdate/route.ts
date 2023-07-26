import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);


export async function POST(request: Request) {
  const data = await request.json();

  await supabase
    .from('tb_transcript')
    .update([{ gpa: data.gpa }])
    .eq('semester', data.semester)
    .eq('student_id', data.student_id),
    await supabase
      .from('tb_students')
      .update({
        repeated: true,
      })
      .eq('course_enrollment_id', data.course_enrollment_id);
}
