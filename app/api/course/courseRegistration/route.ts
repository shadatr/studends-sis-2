import { AddCourseType } from '@/app/types/types';
import { Client } from 'pg';

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
    const insertQuery = `
      INSERT INTO tb_courses (course_number, course_name, hours, credits, passing_percentage, pass, class_work, midterm, final)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;

    const values = [
      data.course_number,
      data.course_name,
      data.hours,
      data.credits,
      data.passing_percentage,
      data.pass,
      data.class_work,
      data.midterm,
      data.final,
    ];

    const result = await client.query(insertQuery, values);

    const insertedCourse = result.rows[0];

    if (insertedCourse && insertedCourse.length > 0) {
      const res: AddCourseType = insertedCourse.data[0];
      const insertQuery = `
      INSERT INTO tb_section (course_id, name)
      VALUES ($1, $2) RETURNING *;
    `;

      const values = [res.id, res.course_name + `(مجموعة1)`];

      await client.query(insertQuery, values);

      await client.end();

      return new Response(
        JSON.stringify({ message: 'تم تسجيل المادة بنجاح' }),
        {
          headers: { 'content-type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error occurred:', error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تسجيل المادة' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET() {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
    await client.connect();

    const queryResult = await client.query('SELECT * FROM tb_courses');

    const data = queryResult.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error occurred:', error);
    return new Response(JSON.stringify({ message: 'an error occured' }), {
      headers: { 'content-type': 'application/json' },
      status: 403,
    });
  }
}
