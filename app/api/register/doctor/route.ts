import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data = await request.json();

  try {
    await supabase.from('tb_doctors').insert([data]);

    const doctors = await supabase
      .from('tb_doctors')
      .select('*')
      .eq('name', data.name)
      .eq('surname', data.surname);

    const doctor = doctors.data;
    if (doctor && doctor.length > 0) {
      const data1 = {
        permission_id: 21,
        doctor_id: doctor[0].id,
      };
      await supabase.from('tb_doctor_perms').insert([data1]);
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
    const { data, error } = await supabase.from('tb_doctors').select('*');
    console.log(data);
    if (error) {
      return new Response(JSON.stringify({ message: 'حدث خطأ ما' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data }));
  } catch {}
}
