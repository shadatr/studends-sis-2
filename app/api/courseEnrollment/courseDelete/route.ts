import { StudentClassType } from '@/app/types/types';
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
      SELECT * FROM tb_course_enrollment
    `;

    const result = await client.query(query);
    const data = result.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'an error occured' }), {
      status: 403,
    });
  }
}


export async function POST(request: Request) {
  const data: StudentClassType = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
    await client.connect();

    if (!(data.class_work || data.midterm || data.final)) {
      // Delete records from tb_grades based on course_enrollment_id
      const deleteGradesQuery = `
        DELETE FROM tb_grades WHERE course_enrollment_id = $1;
      `;

      const deleteGradesValues = [data.id];

      await client.query(deleteGradesQuery, deleteGradesValues);

      // Delete records from tb_course_enrollment based on id
      const deleteCourseEnrollmentQuery = `
        DELETE FROM tb_course_enrollment WHERE id = $1;
      `;

      const deleteCourseEnrollmentValues = [data.id];

      await client.query(
        deleteCourseEnrollmentQuery,
        deleteCourseEnrollmentValues
      );
    } else {
      return new Response(JSON.stringify({ message: 'لا يمكنك مسح المادة' }), {
        headers: { 'content-type': 'application/json' },
        status: 400,
      });
    }

    await client.end();

    return new Response(JSON.stringify({ message: 'تم مسح المادة بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء مسح المادة' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
