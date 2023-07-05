import { RegisterStudentType } from '@/app/types/types';
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
    await supabase.from('tb_admins').insert([data]);

    const doctors = await supabase
      .from('tb_admins')
      .select('*')
      .eq('name', data.name)
      .eq('surname', data.surname)
      .eq('phone', data.phone);

    const data3 = await supabase
      .from('tb_all_permissions')
      .select('*')
      .eq('type', 'admin');

    const doctor = doctors.data;
    const perms = data3.data;

    if (doctor && perms) {
      await Promise.all(
        perms.map(async (per) => {
          const data1 = {
            permission_id: per.id,
            admin_id: doctor[0].id,
          };
          await supabase.from('tb_admin_perms').insert([data1]);
        })
      );
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
    const { data, error } = await supabase.from('tb_admins').select('*');
    console.log(data);
    if (error) {
      return new Response(JSON.stringify({ message: 'حدث خطأ ما' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data }));
  } catch {}
}
