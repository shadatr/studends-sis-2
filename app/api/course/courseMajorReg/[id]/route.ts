import { Client } from 'pg';


export async function POST(request: Request) {
  const data = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();
    const insertQuery = `
      INSERT INTO tb_major_courses (course_id, major_id)
      VALUES ($1, $2) RETURNING *;
    `;

    const values = [data.course_id, data.major_id];

    await client.query(insertQuery, values);

    await client.end();

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
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
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
