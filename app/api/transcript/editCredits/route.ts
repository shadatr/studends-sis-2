import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const data = await request.json();

<<<<<<< HEAD
    const { data: updatedData, error } = await supabase
      .from('tb_students')
      .update({
=======
  await supabase
    .from('tb_students')
    .update([
      {
>>>>>>> 60795405c522ea122ef98b85b257185e32a615e5
        credits: data.credits,
        can_graduate: data.can_graduate,
        graduation_year: data.graduation_year,
      })
      .eq('id', data.student_id);

<<<<<<< HEAD
    if (error) {
      console.log(error.message);
    } else {
      console.log('Update successful');
    }
  } catch (error) {
    console.log(error);
  }
=======
>>>>>>> 60795405c522ea122ef98b85b257185e32a615e5
}
