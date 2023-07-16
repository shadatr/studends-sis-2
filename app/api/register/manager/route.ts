import { Client } from 'pg';

export async function POST(request: Request) {
  // TODO: Maybe add some validation for security here

  const data = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

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
  } catch (error) {
    console.log('Error occurred:', error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل الحساب' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET() {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
    await client.connect();

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
