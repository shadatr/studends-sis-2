import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function GET() {
  try {
    const data = await supabase.from('tb_course_enrollment').select('*');

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}

export async function POST(request: Request) {
  const data = await request.json();

    const res=await supabase
      .from('tb_course_enrollment')
      .delete()
      .eq('id', data.id);

      if(res.error){return new Response(
        JSON.stringify({ message: 'لا يمكنك مسح المادة' }),
        { headers: { 'content-type': 'application/json' }, status: 400 }
      );}
    return new Response(JSON.stringify({ message: 'تم مسح المادة بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  
}
