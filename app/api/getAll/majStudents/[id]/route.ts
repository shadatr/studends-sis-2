import { Client } from 'pg';

const bg = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    await bg.connect();

    const queryResult = await bg.query(
      'SELECT * FROM tb_students WHERE major = $1 AND graduated = false',
      [params.id]
    );

    const data = queryResult.rows;

    await bg.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error occurred:', error);
    await bg.end();
    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 403,
    });
  }
}
