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

    const fetchQuery = `SELECT * FROM tb_students WHERE id = $1`;
    const fetchValues = [params.id];
    const result = await client.query(fetchQuery, fetchValues);

    await client.end();

    const data = result.rows[0];

    if (!data) {
      return new Response(JSON.stringify({ message: 'an error occurred' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 500,
    });
  }
}
