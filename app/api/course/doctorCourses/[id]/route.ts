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

    const query = `
      SELECT *
      FROM tb_classes
      WHERE doctor_id = $1
        AND active = true
    `;

    const dataQueryResult = await client.query(query, [params.id]);
    const data = dataQueryResult.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 403,
    });
  }
}
