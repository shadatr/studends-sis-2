import { createClient } from '@supabase/supabase-js';
import { Database } from '@/app/types/supabase';
import { GetPermissionDoctorType } from '@/app/types/types';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data: GetPermissionDoctorType = await request.json();
  console.log(data);

  try {
    const res = await supabase.from('tb_student_perms').insert([data]);
    console.log(res.error?.message);
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
    console.log(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل الكلية' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
