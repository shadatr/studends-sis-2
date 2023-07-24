import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT) 
});

export async function POST(request: Request) {
  // TODO: Maybe add some validation for security here

  const data = await request.json();
<<<<<<< HEAD

  try {
    await client.connect();

    const res = await client.query(
      'INSERT INTO tb_admins(name, surname, phone, email, password, address, birth_date, enrollment_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        data.name,
        data.surname,
        data.phone,
        data.email,
        data.password,
        data.address ,
        data.birth_date ,
        data.enrollment_date,
      ]
    );

    const queryResult = await client.query(
      'SELECT * FROM tb_admins WHERE name = $1 AND surname = $2 AND phone = $3',
      [data.name, data.surname, data.phone]
    );

    const doctor = queryResult.rows;

    const permissionResult = await client.query(
      'SELECT * FROM tb_all_permissions WHERE type = $1',
      ['admin']
    );
    const perm = permissionResult.rows;

    if (doctor.length > 0 && perm.length > 0) {
      for (const per of perm) {
        const data1 = {
          permission_id: per.id,
          admin_id: doctor[0].id,
        };
        await client.query(
          'INSERT INTO tb_admin_perms(permission_id, admin_id) VALUES ($1, $2)',
          [data1.permission_id, data1.admin_id]
        );
      }
    }

    await client.end();

    return new Response(JSON.stringify({ message: 'تم تسجيل الحساب بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
=======
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
        JSON.stringify({ message: 'يوجد هذا البريد من قبل' }),
        { headers: { 'content-type': 'application/json' }, status: 400 }
      );
    }
    else{
      await supabase.from('tb_admins').insert([data]);
      const admins = await supabase
        .from('tb_admins')
        .select('*')
        .eq('email', data.email);
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
    }
>>>>>>> c89937b3b40845b90f7474c63f0891238bded96b
  } catch (error) {
    console.log('Error occurred:', error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تسجيل الحساب' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET() {
  try {
<<<<<<< HEAD
    await client.connect();
=======
    const data = await supabase.from('tb_admins').select('*');

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }
>>>>>>> c89937b3b40845b90f7474c63f0891238bded96b

    const queryResult = await client.query('SELECT * FROM tb_admins');
    const data = queryResult.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }));
  } catch (error) {
    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 403,
    });
  }
}
