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

    const queryResult = await client.query(
      'SELECT * FROM tb_announcements WHERE posted_for_class_id = $1 ORDER BY id ASC',
      [params.id]
    );

    await client.end();

    console.log(queryResult);

    if (queryResult.rowCount === 0) {
      return new Response(JSON.stringify({ message: 'No data found' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: queryResult.rows }));
  } catch (error) {
    console.error('Error occurred:', error);

    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 403,
    });
  }
}
