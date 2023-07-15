import { PrerequisiteCourseType } from '@/app/types/types';
import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST(request: Request) {
  const data: PrerequisiteCourseType = await request.json();

  try {
    await client.connect();

    const query = `
      INSERT INTO tb_prerequisites_courses (course_id, prerequisite_course_id)
      VALUES ($1, $2)
    `;
    const values = [data.course_id, data.prerequisite_course_id];

    await client.query(query, values);

    await client.end();

    return new Response(JSON.stringify({ message: 'تم تسجيل المادة بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل المادة' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    await client.connect();

    const query = `
      SELECT *
      FROM tb_prerequisites_courses
      WHERE course_id = $1
    `;
    const values = [params.id];

    const result = await client.query(query, values);
    const data = result.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 403,
    });
  }
}
