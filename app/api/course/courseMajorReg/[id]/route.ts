import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST(request: Request) {
  const data = await request.json();

  try {
    await client.connect();

    const res = await client.query(
      'INSERT INTO tb_major_courses (major_id, course_id) VALUES ($1, $2)',
      [data.major_id, data.course_id]
    );

    await client.end();

    console.log(res);

    return new Response(JSON.stringify({ message: 'تم تسجيل المادة بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error occurred:', error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تسجيل المادة' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    await client.connect();

    const queryResult = await client.query(
      'SELECT * FROM tb_major_courses WHERE major_id = $1',
      [params.id]
    );

    const data = queryResult.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error occurred:', error);
    return new Response(JSON.stringify({ message: 'an error occured' }), {
      headers: { 'content-type': 'application/json' },
      status: 403,
    });
  }
}
