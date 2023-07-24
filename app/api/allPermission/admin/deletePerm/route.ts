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

    await client.query(
      'DELETE FROM tb_admin_perms WHERE permission_id = $1 AND admin_id = $2',
      [req.item_per_id, req.item_admin_id]
    );

    await client.end();

    return new Response(JSON.stringify({ message: 'تم مسح التخصص بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error occurred:', error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء مسح التخصص' }),
      {
        headers: { 'content-type': 'application/json' },
        status: 400,
      }
    );
  }
}
