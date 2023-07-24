import { Client } from 'pg';


export async function POST(request: Request) {
  const req = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
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
