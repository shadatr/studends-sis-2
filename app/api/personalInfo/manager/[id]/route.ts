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
      .from('tb_admins')
      .select('*')
      .eq('id', params.id);

    if (error) {
      console.log(error.message);
      return new Response(JSON.stringify({ message: 'an error occurred' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.log(error);
    // Handle the error appropriately
  }
}
