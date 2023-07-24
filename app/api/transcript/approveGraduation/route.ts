import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data = await request.json();

  try {
    await supabase
      .from('tb_students')
      .update([{[data.name]: data.value}])
      .eq('id', data.student_id);

      console.log(data);

      if (data.name == 'graduated' && data.value==true){
        await supabase
          .from('tb_students')
          .update([{ active: false }])
          .eq('id', data.student_id);
      }
        return new Response(
          JSON.stringify({ message: 'تم  الموافقة على الطلاب بنجاح' }),
          {
            headers: { 'content-type': 'application/json' },
          }
        );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'هناك مشكلة' }),
      {
        headers: { 'content-type': 'application/json' },
        status: 400,
      }
    );
  }
}
