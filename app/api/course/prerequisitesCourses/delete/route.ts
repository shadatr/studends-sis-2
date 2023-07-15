import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST(request: Request) {
  const req = await request.json();

  try {
    await client.connect();

    const query = `
      DELETE FROM tb_prerequisites_courses
      WHERE id = $1
    `;
    const values = [req.item_course_id];

    await client.query(query, values);

    await client.end();

    return new Response(JSON.stringify({ message: 'تم حذف المادة بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء حذف المادة' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
