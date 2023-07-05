import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function GET(
  request: Request,
  { params }: { params: { id: number ,year: string} }
) {
  try {
    const data = await supabase
      .from('tb_students')
      .select('*')
      .eq('major', params.id).eq('graduated', true).eq('graduation_year', params.year);

      console.log(data.data);

      console.log(data.data);

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data }));
  } catch {}
}
