import { AssignPermissionType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await supabase
    .from('tb_all_permissions')
    .select('*')
    .eq('id', 22);
  try {
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
  const data: AssignPermissionType = await request.json();

  try {
    await supabase
      .from('tb_all_permissions')
      .update({ active: data.active })
      .eq('id', 22);

      console.log(data);

    return new Response(
      JSON.stringify({ message: 'تم فتح/اغلاق تسجيل المواد بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ message: 'حدث خطأ أثناء التحديث' }), {
      headers: { 'content-type': 'application/json' },
      status: 500,
    });
  }
}
