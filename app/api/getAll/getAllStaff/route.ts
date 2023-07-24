import { Client } from 'pg';


export async function GET() {
  try {

    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();

    const query = 'SELECT * FROM tb_admins';
    const result = await client.query(query);

    await client.end();


    return new Response(JSON.stringify({ message: result.rows }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}
