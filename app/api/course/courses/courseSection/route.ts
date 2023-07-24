import { Client } from 'pg';


export async function GET() {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();

    const dataQueryResult = await client.query(
      'SELECT c.*, m.* FROM tb_courses c INNER JOIN tb_majors m ON c.major_id = m.id'
    );

    const data = dataQueryResult.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 403,
    });
  }
}

export async function POST(request: Request) {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
    await client.connect();

    const req = await request.json();

    await client.query('DELETE FROM tb_courses WHERE id = $1', [req]);

    await client.end();

    return new Response(JSON.stringify({ message: 'تم حذف المادة بنجاح' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء حذف المادة' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}
