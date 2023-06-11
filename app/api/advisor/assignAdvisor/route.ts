import { createClient } from '@supabase/supabase-js';
import { AssignAdvisorType } from '@/app/types/types';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data: AssignAdvisorType = await request.json();
  console.log(data);

  try {
    const res = await supabase.from('tb_students').update( {advisor: data.advisor} ).eq("id", data.id);
    console.log(res);
    
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
