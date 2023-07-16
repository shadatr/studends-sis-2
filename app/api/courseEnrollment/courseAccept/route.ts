import { Client } from 'pg';

export async function GET() {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '',
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

    const updateQuery = `
      UPDATE tb_course_enrollment
      SET approved = $1
      WHERE id = $2
    `;
    const updateValues = [data.course.approved, data.course.id];

    const sectionUpdateQuery = `
      UPDATE tb_section
      SET students_num = $1
      WHERE id = $2
    `;
    const sectionUpdateValues = [
      data.course.students_num,
      data.course.section_id,
    ];

    const insertQuery = `
      INSERT INTO tb_grades (id, course_id, student_id, grade)
      VALUES ($1, $2, $3, $4)
    `;
    const insertValues = [
      data.grade.id,
      data.grade.course_id,
      data.grade.student_id,
      data.grade.grade,
    ];

    await client.query(updateQuery, updateValues);
    await client.query(sectionUpdateQuery, sectionUpdateValues);
    await client.query(insertQuery, insertValues);

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم الموافقة على المواد بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء الموافقة على المواد' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
