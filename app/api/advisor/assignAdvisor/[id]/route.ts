import { AssignAdvisorType } from '@/app/types/types';
import { Client } from 'pg';

export async function POST(request: Request) {
  const data: AssignAdvisorType = await request.json();

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
      'UPDATE tb_students SET advisor = $1 WHERE id = $2',
      [data.advisor, data.id]
    );

    await client.end();

    console.log(queryResult);

    return new Response(JSON.stringify({ message: 'تم تعيين الدكتور بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error occurred:', error);

    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تعيين الدكتور' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

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
      'SELECT * FROM tb_students WHERE advisor = $1 AND graduated = false',
      [params.id]
    );

    await client.end();

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
