import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // TODO: Maybe add some validation for security here

  const data = await request.json();

  try {
    const students = await supabase
      .from('tb_students')
      .select('*')
      .eq('email', data.email);

    if (students.data && students.data.length > 0) {
      return new Response(
        JSON.stringify({ message: 'يوجد هذا البريد من قبل' }),
        { headers: { 'content-type': 'application/json' }, status: 400 }
      );
    } else {
      await supabase.from('tb_students').insert([data]);
      const students = await supabase
        .from('tb_students')
        .select('*')
        .eq('email', data.email);
      const student = students.data;
      if (student) {
        const data1 = {
          permission_id: 20,
          student_id: student[0].id,
        };
        await supabase.from('tb_student_perms').insert([data1]);
      }

      return new Response(
        JSON.stringify({ message: 'تم تسجيل الحساب بنجاح' }),
        {
          headers: { 'content-type': 'application/json' },
        }
      );
    }
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
    const data = await supabase.from('tb_students').select('*');

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
