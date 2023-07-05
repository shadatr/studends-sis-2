import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  // TODO: Maybe add some validation for security here

  const data = await request.json();

  try {
    const res = await supabase.from('tb_students').insert([data]);
    const students = await supabase
      .from('tb_students')
      .select('*')
      .eq('name', data.name)
      .eq('surname', data.surname);

    console.log(res.error?.message);

    const student = students.data;
    if (student) {
      const data1 = {
        permission_id: 20,
        student_id: student[0].id,
      };
      const res2 = await supabase.from('tb_student_perms').insert([data1]);
      console.log(res2);
    }

    return new Response(JSON.stringify({ message: 'تم تسجيل الحساب بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    // send a 400 response with an error happened during registration in Arabic
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تسجيل الحساب' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase.from('tb_students').select('*');
    console.log(data);
    if (error) {
      return new Response(JSON.stringify({ message: 'حدث خطأ ما' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data }));
  } catch {}
}
