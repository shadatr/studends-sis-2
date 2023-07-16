import { Client } from 'pg';

export async function POST(request: Request) {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    const { id } = await request.json();

    await client.connect();

    const deleteQuery = `
      DELETE FROM tb_exam_program
      WHERE id = $1
    `;
    const values = [id];

    await client.query(deleteQuery, values);

    await client.end();

    return new Response(JSON.stringify({ message: 'تم حذف الامتحان بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء حذف الامتحان' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
