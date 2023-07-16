import { Client } from 'pg';
import { GetPermissionType } from '@/app/types/types';

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();

    const queryResult = await client.query(
      'SELECT * FROM tb_all_permissions WHERE type = $1',
      [params.name]
    );

    await client.end();

    if (queryResult.rowCount === 0) {
      return new Response(JSON.stringify({ message: 'No data found' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: queryResult.rows }));
  } catch (error) {
    console.error('Error occurred:', error);

    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 403,
    });
  }
}

export async function POST(request: Request) {
  const data: GetPermissionType = await request.json();

  try {

    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();

    const queryResult = await client.query(
      'INSERT INTO tb_admin_perms(permission_id, admin_id) VALUES ($1, $2)',
      [data.permission_id, data.admin_id]
    );

    await client.end();

    console.log(queryResult);

    return new Response(
      JSON.stringify({ message: 'تم تسجيل الصلاحية بنجاح' }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error occurred:', error);

    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تسجيل الكلية' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
