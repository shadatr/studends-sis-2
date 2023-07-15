import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST(request: Request) {
  const data = await request.json();

  try {
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
