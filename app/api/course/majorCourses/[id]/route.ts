import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: number } }) {
  try {
    const data = await supabase.from('tb_courses').select('*').eq('major_id', params.id);

    console.log(data.error?.message);
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
  await supabase
    .from('tb_major_courses')
    .delete()
    .eq('id', req);
  return new Response(JSON.stringify({ message: 'تم حذف المادة بنجاح' }));
}