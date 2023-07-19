import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  // TODO: Maybe add some validation for security here

  const data = await request.json();
  if (data.address === '') {
    data.address = undefined;
  }
  if (data.phone === '') {
    data.phone = undefined;
  }

  try {
    
    const admins = await supabase
    .from('tb_admins')
    .select('*')
    .eq('email', data.email);
    
    if (admins.data && admins.data.length > 0) {
      return new Response(
        JSON.stringify({ message: 'حدث خطأ اثناء تسجيل الحساب' }),
        { headers: { 'content-type': 'application/json' }, status: 400 }
        );
      }
      await supabase.from('tb_admins').insert([data]);

    const data3 = await supabase
      .from('tb_all_permissions')
      .select('*')
      .eq('type', 'admin');

    const doctor = admins.data;
    const perm = data3.data;

    if (doctor && perm) {
      perm.map(async (per) => {
        const data1 = {
          permission_id: per.id,
          admin_id: doctor[0].id,
        };
        await supabase.from('tb_admin_perms').insert([data1]);
      });
    }

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
    const data = await supabase.from('tb_admins').select('*');

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}
