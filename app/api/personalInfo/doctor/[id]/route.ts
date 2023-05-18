import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function GET(request : Request, { params }: { params: { id: number } }) {
  try {
    const { data, error } = await supabase.from('tb_doctors').select('*').eq("id", params.id);

    console.log(data);
    if (error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data }));
  } catch { }
}
