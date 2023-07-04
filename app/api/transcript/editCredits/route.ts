import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data = await request.json();

  const res = await supabase
    .from('tb_students')
    .update([
      {
        credits: data.credits,
        graduated: data.graduation,
        graduation_year: data.graduation_year,
      },
    ])
    .eq('id', data.student_id);

    console.log(data);
}
