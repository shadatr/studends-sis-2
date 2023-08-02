import { AddCourseType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const data: AddCourseType = await request.json();

  try {
    await supabase.from('tb_major_courses').insert([data]);
    return new Response(JSON.stringify({ message: 'تم تسجيل المادة بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل المادة' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { majorId: number; depId: number } }
) {
  try {
    if (params.depId == -1) {
      const data = await supabase
        .from('tb_major_courses')
        .select('*')
        .eq('major_id', params.majorId);
      if (data.error) {
        return new Response(JSON.stringify({ message: 'an error occured' }), {
          status: 403,
        });
      }

      return new Response(JSON.stringify({ message: data.data }), {
        status: 200,
        headers: { revalidate: dynamic },
      });
    } else {
      const data = await supabase
        .from('tb_major_courses')
        .select('*')
        .eq('major_id', params.majorId)
        .eq('department_id', params.depId);

      if (data.error) {
        return new Response(JSON.stringify({ message: 'an error occured' }), {
          status: 403,
        });
      }

      return new Response(JSON.stringify({ message: data.data }), {
        status: 200,
        headers: { revalidate: dynamic },
      });
    }
  } catch {}
}
