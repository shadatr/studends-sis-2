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
  { params }: { params: { id: number; name: string } }
) {
  try {
    await client.connect();

    const classesQuery = `
      SELECT *
      FROM tb_classes
      WHERE section_id = $1 AND semester = $2
    `;
    const classesValues = [params.id, params.name];
    const classesResult = await client.query(classesQuery, classesValues);
    const classesData = classesResult.rows;

    const courseEnrollmentQuery = `
      SELECT *
      FROM tb_course_enrollment
      WHERE class_id = $1
    `;
    const courseEnrollmentValues = [classesData[0].id];
    const courseEnrollmentResult = await client.query(
      courseEnrollmentQuery,
      courseEnrollmentValues
    );
    const courseEnrollmentData = courseEnrollmentResult.rows;

    await client.end();

    return new Response(JSON.stringify({ message: courseEnrollmentData }));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}
