import { Client } from 'pg';
import { AssignPermissionType } from '@/app/types/types';

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

    const queryResult = await client.query(
      'SELECT * FROM tb_all_permissions WHERE id = $1',
      [22]
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
  const data: AssignPermissionType = await request.json();

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
      'UPDATE tb_all_permissions SET active = $1 WHERE id = $2',
      [data.active, 22]
    );

    await client.end();

    console.log(queryResult);

    return new Response(
      JSON.stringify({ message: 'تم فتح/إغلاق تسجيل المواد بنجاح' }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error occurred:', error);

    return new Response(JSON.stringify({ message: 'حدث خطأ أثناء التحديث' }), {
      headers: { 'content-type': 'application/json' },
      status: 500,
    });
  }
}
