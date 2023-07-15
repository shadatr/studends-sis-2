import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    await client.connect();

    const query = `
      SELECT *
      FROM tb_courses
      WHERE major_id = $1 AND active = true
    `;
    const values = [params.id];

    const result = await client.query(query, values);
    const data = result.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 403,
    });
  }
}

export async function POST(request: Request) {
  const req = await request.json();

  try {
    await client.connect();

    const query = `
      DELETE FROM tb_major_courses
      WHERE id = $1
    `;
    const values = [req];

    await client.query(query, values);

    await client.end();

    return new Response(JSON.stringify({ message: 'تم حذف المادة بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 500,
    });
  }
}
