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

    const query = 'SELECT * FROM tb_section WHERE course_id = $1';
    const values = [params.id];
    const result = await client.query(query, values);

    await client.end();

    const data = result.rows;

    return new Response(JSON.stringify({ message: data }));
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}
