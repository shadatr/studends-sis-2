import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST(request: Request) {
  try {
    await client.connect();

    const { active } = await request.json();
    
    await client.query(
      'UPDATE tb_student_perms SET active = $1 WHERE permission_id = $2',
      [active, 20]
    );

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم فتح/إغلاق تسجيل المواد بنجاح' }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error occurred:', error);

    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء فتح تسجيل المواد' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET() {
  try {
    await client.connect();

    const queryResult = await client.query(
      'SELECT * FROM tb_student_perms WHERE permission_id = $1',
      [20]
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
