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

    const query =
      'SELECT * FROM tb_course_enrollment WHERE student_id = $1 AND approved = $2';
    const values = [params.id, true];
    const result = await client.query(query, values);

    await client.end();

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: result.rows }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}
