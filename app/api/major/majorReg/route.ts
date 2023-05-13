import {  MajorRegType } from '@/app/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data: MajorRegType = await request.json();

  try {
    const res = await supabase.from('tb_majors').insert([data]);
    if (res.error) {
      console.log(res.error);
      throw res.error;
    }
    return new Response(JSON.stringify({ message: 'تم تسجيل التخصص بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل التخصص' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET() {
  try {
    const data = await supabase.from('tb_majors').select('*');

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}
