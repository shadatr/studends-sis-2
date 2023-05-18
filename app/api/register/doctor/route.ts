import { RegisterStudentType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  // TODO: Maybe add some validation for security here

  const data: RegisterStudentType = await request.json();


  try {
    const res = await supabase.from('tb_doctors').insert([data]);
    if (res.error) {
      console.log(res.error);
      throw res.error;
    }
    return new Response(JSON.stringify({ message: 'تم تسجيل الحساب بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    // send a 400 response with an error happened during registration in arabic
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل الحساب' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET() {
  try {
    const data = await supabase
      .from('tb_doctors')
      .select('*');
    console.log(data.data);
    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}

