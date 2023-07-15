import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    await client.connect();

    const selectClassesQuery = `
      SELECT *
      FROM tb_classes
      WHERE section_id = $1 AND active = true
      ORDER BY id ASC
    `;
    const selectClassesValues = [params.id];

    const classesResult = await client.query(
      selectClassesQuery,
      selectClassesValues
    );

    const classesData = classesResult.rows;

    const selectEnrollmentQuery = `
      SELECT *
      FROM tb_course_enrollment
      WHERE class_id = $1 AND approved = true
      ORDER BY id ASC
    `;
    const selectEnrollmentValues = [classesData[0].id];

    const enrollmentResult = await client.query(
      selectEnrollmentQuery,
      selectEnrollmentValues
    );

    await client.end();

    const enrollmentData = enrollmentResult.rows;

    return new Response(JSON.stringify({ message: enrollmentData }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'حدث خطأ أثناء استرجاع بيانات التسجيل في المجموعة',
      }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
