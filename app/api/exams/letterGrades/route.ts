import { LetterGradesType } from '@/app/types/types';
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

    const query = `
      SELECT *
      FROM tb_grades
    `;

    const result = await client.query(query);
    const data = result.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  const data = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();

    await Promise.all(
      data.map(async (item: LetterGradesType) => {
        const query = `
          UPDATE tb_grades
          SET letter_grade = $1, points = $2
          WHERE course_enrollment_id = $3
        `;
        const values = [
          item.letter_grade,
          item.points,
          item.course_enrollment_id,
        ];

        await client.query(query, values);
      })
    );

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم تسجيل الامتحان بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل الامتحان' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
