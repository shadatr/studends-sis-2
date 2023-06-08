import { GetPermissionStudentType, RegisterStudentType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  // TODO: Maybe add some validation for security here

  const data: RegisterStudentType = await request.json();
  if (data.address === '') {
    data.address = undefined;
  }
  if (data.phone === '') {
    data.phone = undefined;
  }

  try {
    const res = await supabase.from('tb_students').insert([data]);
    const { data: students, error } = await supabase
      .from('tb_students')
      .select('*')
      .eq('name', data.name)
      .eq('surname', data.surname);

    if (error) {
      throw error;
    }

    if (!students || students.length === 0) {
      throw new Error('No matching student found.');
    }

    const student = students[0];
    const data1: GetPermissionStudentType = {
      permission_id: 20,
      student_id: student.id,
    };

     await supabase.from('tb_student_perms').insert([data1]);
    console.log(res.error?.message);

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
    const data = await supabase.from('tb_students').select('*');
    console.log(data.data);
    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}
