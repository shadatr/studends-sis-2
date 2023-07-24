import { Client } from 'pg';

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
    await client.connect();

    const { id } = params;
    const query = 'SELECT * FROM tb_majors WHERE id = $1';
    const values = [id];

    const result = await client.query(query, values);
    const data = result.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
