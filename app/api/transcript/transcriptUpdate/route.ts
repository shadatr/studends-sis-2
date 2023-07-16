import { Client } from 'pg';

export async function POST(request: Request) {
  const data = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();

    const updateTranscriptQuery = `UPDATE tb_transcript SET gpa = $1 WHERE semester = $2 AND student_id = $3`;
    const updateTranscriptParams = [data.gpa, data.semester, data.student_id];
    await client.query(updateTranscriptQuery, updateTranscriptParams);

    const updateStudentsQuery = `UPDATE tb_students SET repeated = true WHERE course_enrollment_id = $1`;
    const updateStudentsParams = [data.course_enrollment_id];
    await client.query(updateStudentsQuery, updateStudentsParams);

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم تحديث البيانات بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تحديث البيانات' }),
      {
        headers: { 'content-type': 'application/json' },
        status: 400,
      }
    );
  }
}
