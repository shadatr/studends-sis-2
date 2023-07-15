import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST() {
  try {
    await client.connect();

    const deleteQuery = `
      DELETE FROM tb_exam_program
      WHERE id >= 0
    `;
    await client.query(deleteQuery);

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
