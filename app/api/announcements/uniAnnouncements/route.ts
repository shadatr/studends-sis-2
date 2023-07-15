import { Client } from 'pg';

export async function GET() {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();

    const queryResult = await client.query(
      'SELECT * FROM tb_announcements WHERE general = TRUE ORDER BY created_at DESC'
    );

    await client.end();

    const data = queryResult.rows;

    return new Response(JSON.stringify({ message: data }));
  } catch (error) {
    console.error('Error occurred:', error);

    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 403,
    });
  }
}

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

    await client.query('DELETE FROM tb_announcements WHERE id = $1', [
      req.item_id,
    ]);

    await client.end();

    return new Response(JSON.stringify({ message: 'تم حذف الاعلان بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error occurred:', error);

    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      headers: { 'content-type': 'application/json' },
      status: 400,
    });
  }
}
