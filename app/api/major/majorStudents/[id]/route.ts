import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const { data, error } = await supabase
      .from('tb_students')
      .select('*')
      .eq('major', params.id);

    if (error) {
      return new Response(JSON.stringify({ message: 'an error occurred' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data }));
  } catch (error) {
    // Handle the error here if necessary
  }
}
