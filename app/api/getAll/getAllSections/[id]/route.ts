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
    console.log(params.id);
    const data = await supabase
      .from('tb_section')
      .select('*')
      .eq('course_id', params.id);
    console.log(data.data);

    console.log(data.error?.message);
    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}
