import { ExamProgramType } from '@/app/types/types';
import { Client } from 'pg';

export async function POST(request: Request) {
  const data: ExamProgramType = await request.json();

  try {
    const bg = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await bg.connect();

    await bg.query(
      'INSERT INTO tb_exam_program (course_id, date, hour, duration, location) VALUES ($1, $2, $3, $4, $5)',
      [data.course_id, data.date, data.hour, data.duration, data.location]
    );


    await bg.end();

    return new Response(
      JSON.stringify({ message: 'تم تسجيل الامتحان بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error occurred:', error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تسجيل الامتحان' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const bg = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await bg.connect();

    const queryResult = await bg.query(
      'SELECT * FROM tb_exam_program WHERE course_id = $1 ORDER BY date ASC',
      [params.id]
    );

    const data = queryResult.rows;

    await bg.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error occurred:', error);
    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 403,
    });
  }
}

