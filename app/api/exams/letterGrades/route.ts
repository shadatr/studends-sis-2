import { LetterGradesType } from '@/app/types/types';
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
    console.error(error);
    await client.end();
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل الامتحان' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
