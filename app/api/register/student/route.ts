import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST(request: Request) {
  // TODO: Maybe add some validation for security here

  const data = await request.json();

  try {
    await client.connect();

    const insertQuery = `
      INSERT INTO tb_students (name, surname, major, email)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const insertValues = [data.name, data.surname, data.major, data.email];
    const insertResult = await client.query(insertQuery, insertValues);
    const studentId = insertResult.rows[0].id;

    const data1 = {
      permission_id: 20,
      student_id: studentId,
    };
    const insertQuery2 = `
      INSERT INTO tb_student_perms (permission_id, student_id)
      VALUES ($1, $2)
    `;
    const insertValues2 = [data1.permission_id, data1.student_id];
    await client.query(insertQuery2, insertValues2);

    await client.end();

    return new Response(JSON.stringify({ message: 'تم تسجيل الحساب بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل الحساب' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET() {
  try {
    await client.connect();

    const fetchQuery = `SELECT * FROM tb_students`;
    const fetchResult = await client.query(fetchQuery);
    const data = fetchResult.rows;

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
