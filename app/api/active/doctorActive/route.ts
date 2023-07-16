import { Client } from 'pg';


export async function POST(request: Request) {
  const { doctorId, active } = await request.json();

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
      'UPDATE tb_doctors SET active = $1 WHERE id = $2',
      [active, doctorId]
    );

    await client.end();

    if (queryResult.rowCount === 0) {
      return new Response(
        JSON.stringify({ message: 'No matching rows found' }),
        {
          headers: { 'content-type': 'application/json' },
          status: 400,
        }
      );
    }

    return new Response(
      JSON.stringify({ message: 'تم تغيير حالة الدكتور بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error occurred:', error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تغيير حالة الدكتور' }),
      {
        headers: { 'content-type': 'application/json' },
        status: 400,
      }
    );
  }
}
