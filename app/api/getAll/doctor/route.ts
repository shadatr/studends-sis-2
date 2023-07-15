import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function GET() {
  try {
    await client.connect();

    const query = `SELECT * FROM tb_doctors`;
    const result = await client.query(query);
    const doctors = result.rows;

    await client.end();

    return new Response(JSON.stringify({ message: doctors }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}
