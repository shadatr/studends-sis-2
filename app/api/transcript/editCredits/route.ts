import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data = await request.json();

  await supabase
    .from('tb_students')
    .update([
      {
        credits: data.credits,
        can_graduate: data.can_graduate,
        graduation_year: data.graduation_year,
      },
    ])
    .eq('id', data.student_id);

}
