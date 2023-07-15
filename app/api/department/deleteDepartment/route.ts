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

    const deleteQuery = `
      DELETE FROM tb_departments
      WHERE name = $1
    `;
    const deleteValues = [req.item_name];

    const deleteResult = await client.query(deleteQuery, deleteValues);

    await client.end();

    if (deleteResult.rowCount > 0) {
      return new Response(JSON.stringify({ message: 'تم مسح الكلية بنجاح' }), {
        headers: { 'content-type': 'application/json' },
      });
    } else {
      return new Response(
        JSON.stringify({ message: 'حدث خطأ أثناء مسح الكلية' }),
        { headers: { 'content-type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء مسح الكلية' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
