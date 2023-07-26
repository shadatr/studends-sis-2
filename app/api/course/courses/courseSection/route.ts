import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await supabase
      .from('tb_courses')
      .select('*, tb_majors!inner(*)');

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }), {
      status: 200,
      headers: { revalidate: dynamic },
    });
  } catch {}
}


export async function POST(request: Request) {
  const req = await request.json();
  await supabase.from('tb_courses').delete().eq('id', req);
  return new Response(JSON.stringify({ message: 'تم حذف المادة بنجاح' }));
}