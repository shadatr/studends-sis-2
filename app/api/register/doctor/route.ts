import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  // TODO: Maybe add some validation for security here

  const data = await request.json();

  try {
    const doctors = await supabase
      .from('tb_doctors')
      .select('*')
      .eq('email', data.email);

    if (doctors.data && doctors.data.length > 0) {
      return new Response(
        JSON.stringify({ message: 'يوجد هذا البريد من قبل' }),
        {
          headers: { 'content-type': 'application/json' },
          status: 400,
        }
      );
    } else {
      await supabase.from('tb_doctors').insert([data]);
      
      const doctors = await supabase
        .from('tb_doctors')
        .select('*')
        .eq('email', data.email);

      const doctor = doctors.data;
      if (doctor) {
        const data1 = {
          permission_id: 21,
          doctor_id: doctor[0].id,
        };
        await supabase.from('tb_doctor_perms').insert([data1]);
      }

      return new Response(
        JSON.stringify({ message: 'تم تسجيل الحساب بنجاح' }),
        {
          headers: { 'content-type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل الحساب' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET() {
  try {
    const data = await supabase.from('tb_doctors').select('*');
    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}
