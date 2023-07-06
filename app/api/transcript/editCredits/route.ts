import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { data: updatedData, error } = await supabase
      .from('tb_students')
      .update({
        credits: data.credits,
        graduated: data.graduation,
        graduation_year: data.graduation_year,
      })
      .eq('id', data.student_id);

    if (error) {
      console.log(error.message);
    } else {
      console.log('Update successful');
    }
  } catch (error) {
    console.log(error);
  }
}
