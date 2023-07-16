import { Client } from 'pg';
import { StudentClassType } from '@/app/types/types';

export async function POST(
  request: Request,
  { params }: { params: { id: number} }
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

    const data1: StudentClassType[] = await request.json();

    const updatePromises = data1.map(async (item) => {
      const updateQuery = `
        UPDATE tb_course_enrollment
        SET
          student_id = $1,
          class_id = $2,
          semester = $3,
          class_work = $4,
          midterm = $5,
          final = $6,
          pass = $7,
          result = $8,
          can_repeat = $9,
          approved = $10
        WHERE
          id = $11
          AND student_id = $12
      `;
      const updateValues = [
        item.student_id,
        item.class_id,
        item.semester,
        item.class_work,
        item.midterm,
        item.final,
        item.pass,
        item.result,
        item.can_repeat,
        item.approved,
        item.id,
        params.id,
      ];
      await client.query(updateQuery, updateValues);
    });

    await Promise.all(updatePromises);

    await client.end();

    return new Response(JSON.stringify({ message: 'تم حذف الاعلان بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}
