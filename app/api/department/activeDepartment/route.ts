import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const { depId, active } = await request.json();
  const data = await supabase
    .from('tb_departments')
    .update({ active: active })
    .eq('id', depId);

    await supabase
      .from('tb_majors')
      .update({ active: active })
      .eq('department_id', depId);

  if (!data.error) {
    return new Response(
      JSON.stringify({ message: 'تم تغيير حالة القسم بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  }
}