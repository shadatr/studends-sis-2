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

    await client.query(
      'INSERT INTO tb_classes (name, description) VALUES ($1, $2)',
      [data.name, data.description]
    );

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم تسجيل المحاضرة بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error occurred:', error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تسجيل المحاضرة' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
