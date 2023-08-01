import { createClient } from '@supabase/supabase-js';
import { Database } from '@/app/types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await supabase
    .from('tb_admin_majors')
    .select('*')
    .eq('admin_id', params.id);
  try {
    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
        headers: { revalidate: dynamic },
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}

export async function POST(request: Request) {
  const data = await request.json();

  try {
    const res = await supabase.from('tb_admin_majors').insert([data]);
    if (res.error) {
      throw res.error;
    }
    return new Response(
      JSON.stringify({ message: 'تم تسجيل الصلاحية بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ  ' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
