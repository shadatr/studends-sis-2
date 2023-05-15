import { DepartmentRegType } from '@/app/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {

  const data: DepartmentRegType = await request.json();


  try {
    const res = await supabase.from('tb_departments').insert([data]);
    console.log(res.error?.message);
    if (res.error) {
      console.log(res.error);
      throw res.error;
    }
    return new Response(JSON.stringify({ message: "تم تسجيل الكلية بنجاح"}), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل الكلية' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}


export async function GET() {
  try {
    const data = await supabase
      .from('tb_departments')
      .select('*',);

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}

