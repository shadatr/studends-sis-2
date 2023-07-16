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

    await client.connect();

    const req = await request.json();

    const deleteQuery = 'DELETE FROM tb_majors WHERE major_name = $1';
    const deleteValues = [req.item_name];

    await client.query(deleteQuery, deleteValues);

    await client.end();

    return new Response(JSON.stringify({ message: 'تم مسح التخصص بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء مسح التخصص' }),
      { headers: { 'content-type': 'application/json' }, status: 500 }
    );
  }
}
