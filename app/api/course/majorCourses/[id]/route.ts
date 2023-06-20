import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function GET(request: Request, { params }: { params: { id: number } }) {
  try {
    const data = await supabase.from('tb_courses').select('*').eq('major_id', params.id).eq('active',true);

    console.log(data.error?.message);
    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}
