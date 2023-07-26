import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await supabase.from('tb_majors').select('*, tb_departments!inner(*)');

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
  const { majorId, active } = await request.json();
  const data = await supabase
    .from('tb_majors')
    .update({ active: active })
    .eq('id', majorId);

  if (!data.error) {
    return new Response(
      JSON.stringify({ message: 'تم تغيير حالة التخصص بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  }
}