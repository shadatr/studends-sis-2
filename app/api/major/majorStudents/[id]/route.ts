import { Client } from 'pg';

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();

    const query = `
      SELECT *
      FROM tb_students
      WHERE major = $1 AND graduated = false
    `;
    const values = [params.id];

    const result = await client.query(query, values);
    const data = result.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 403,
    });
  }
}
