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
      .from('tb_students')
      .select('*')
<<<<<<< HEAD:app/api/getAll/majStudents/[id]/route.ts
      .eq('major', params.id);
=======
      .eq('major', params.id).eq('graduated', false);
>>>>>>> 60795405c522ea122ef98b85b257185e32a615e5:app/api/major/majorStudents/[id]/route.ts

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403
      });
    }

    return new Response(JSON.stringify({ message: data.data }),);
  } catch {
    // Handle error
  }
}
