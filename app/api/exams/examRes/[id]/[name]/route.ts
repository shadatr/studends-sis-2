import { Client } from 'pg';
import { StudentClassType } from '@/app/types/types';

export async function GET(
  request: Request,
  { params }: { params: { id: number; name: string } }
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

    const classesQuery = `
      SELECT *
      FROM tb_classes
      WHERE section_id = $1 AND active = true
    `;
    const classesValues = [params.id];

    const sectionsQuery = `
      SELECT *
      FROM tb_section
      WHERE id = $1
    `;
    const sectionsValues = [params.id];

    const [classesResult, sectionsResult] = await Promise.all([
      client.query(classesQuery, classesValues),
      client.query(sectionsQuery, sectionsValues),
    ]);

    const classesData = classesResult.rows;
    const sectionsData = sectionsResult.rows;

    if (classesData.length > 0 && sectionsData.length > 0) {
      const classId = classesData[0].id;
      const courseEnrollmentsQuery = `
        SELECT *
        FROM tb_course_enrollment
        WHERE approved = true AND class_id = $1
      `;
      const courseEnrollmentsValues = [classId];

      const courseQuery = `
        SELECT *
        FROM tb_courses
        WHERE id = $1
      `;
      const courseValues = [sectionsData[0].course_id];

      const [courseEnrollmentsResult, courseResult] = await Promise.all([
        client.query(courseEnrollmentsQuery, courseEnrollmentsValues),
        client.query(courseQuery, courseValues),
      ]);

      const courseEnrollmentsData = courseEnrollmentsResult.rows;
      const courseData = courseResult.rows;

      const data = {
        courseEnrollments: courseEnrollmentsData,
        course: courseData,
        section: sectionsData,
        class: classesData,
      };

      await client.end();

      return new Response(JSON.stringify({ message: data }), {
        status: 200,
      });
    }

    await client.end();
    console.log('not found');

    return new Response(JSON.stringify({ message: 'Not found' }), {
      status: 404,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: number; name: string } }
) {
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

    const classesQuery = `
      SELECT *
      FROM tb_classes
      WHERE section_id = $1
    `;
    const classesValues = [params.id];

    const classesResult = await client.query(classesQuery, classesValues);
    const classesData = classesResult.rows;

    await Promise.all(
      data.map(async (item: StudentClassType) => {
        const updateQuery = `
          UPDATE tb_course_enrollment
          SET
            student_id = $1,
            class_id = $2
          WHERE
            student_id = $3
            AND class_id = $4
        `;
        const updateValues = [
          item.student_id,
          classesData[0].id,
          item.student_id,
          classesData[0].id,
        ];

        const result = await client.query(updateQuery, updateValues);
        return result;
      })
    );

    await client.end();

    return new Response(JSON.stringify({ message: 'تم حذف الاعلان بنجاح' }));
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تحديث بيانات الاعلان' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
