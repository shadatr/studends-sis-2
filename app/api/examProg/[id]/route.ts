import { Client } from 'pg';
import { ExamProgramType } from '@/app/types/types';

export async function POST(request: Request) {
  const data: ExamProgramType = await request.json();

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
      'INSERT INTO tb_exam_program (course_id, date, hour, duration, location) VALUES ($1, $2, $3, $4, $5)',
      [data.course_id, data.date, data.hour, data.duration, data.location]
    );

    await client.end();

    console.log(queryResult);

    return new Response(
      JSON.stringify({ message: 'تم تسجيل الامتحان بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error occurred:', error);

    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل الامتحان' }),
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
      'SELECT * FROM tb_exam_program WHERE course_id = $1 ORDER BY date ASC',
      [params.id]
    );

    await client.end();

    console.log(queryResult);

    return new Response(JSON.stringify({ message: queryResult.rows }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error occurred:', error);

    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 403,
    });
  }
}
