import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const { active } = await request.json();
    console.log(active);

    await supabase
      .from('tb_student_perms')
      .update({ active })
      .eq('permission_id', 20);

    return new Response(
      JSON.stringify({ message: 'تم فتح/اغلاق تسجيل المواد بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء فتح تسجيل المواد' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET() {
  const data = await supabase
    .from('tb_student_perms')
    .select('*')
    .eq('permission_id', 20);
  try {
    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}
