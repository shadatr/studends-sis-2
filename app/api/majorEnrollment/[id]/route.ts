import { createClient } from '@supabase/supabase-js';
import { MajorEnrollmentType } from '@/app/types/types';
import { Database } from '@/app/types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const data: MajorEnrollmentType = await request.json();
console.log(data);
  try {
    const res = await supabase.from('tb_major_enrollments').insert([data]);
    
    console.log(res.error?.message);
    if (res.error) {
      throw res.error.message;
    }
    return new Response(JSON.stringify({ message: 'تم  نشر الاعلان بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'هناك مشكلة، لم يتم نشر الاعلان' }),
      {
        headers: { 'content-type': 'application/json' },
        status: 400,
      }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const data = await supabase
      .from('tb_majors')
      .select('*')
      .eq('id', params.id);
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
