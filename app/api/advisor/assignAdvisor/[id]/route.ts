import { createClient } from '@supabase/supabase-js';
import { AssignAdvisorType } from '@/app/types/types';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const data: AssignAdvisorType = await request.json();

  try {
    const res = await supabase.from('tb_students').update( {advisor: data.advisor} ).eq("id", data.id);
    console.log(res);
    
    return new Response(
      JSON.stringify({ message: 'تم تعيين الدكتور بنجاح ' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء  تعيين الدكتور ' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const data = await supabase
      .from('tb_students')
      .select('*')
      .eq('advisor', params.id)
      .eq('graduated', false);

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 200,
        headers: { revalidate: dynamic },
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}