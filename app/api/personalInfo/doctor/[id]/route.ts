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
    const { data, error } = await supabase
      .from('tb_doctors')
      .select('*')
      .eq('id', params.id);

<<<<<<< HEAD
    if (error) {
      return new Response(JSON.stringify({ message: 'an error occurred' }), {
=======
    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
>>>>>>> 60795405c522ea122ef98b85b257185e32a615e5
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle any additional error handling if needed
  }
}
