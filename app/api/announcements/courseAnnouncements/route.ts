import { createClient } from '@supabase/supabase-js';


const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);


export async function GET() {
  try {
    const data = await supabase.from('tb_announcements').select('*').order("created_at", {ascending : false}).eq('type', 'course');


    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}
