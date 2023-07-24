import { Client } from 'pg';


export async function POST(request: Request) {
  // TODO: Maybe add some validation for security here

  const data = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
    await client.connect();

    const students = `SELECT * FROM tb_students WHERE email = ${data.email} `;
     const fetchResult = await client.query(students);

    if (fetchResult.rows && fetchResult.rows.length > 0) {
      return new Response(
        JSON.stringify({ message: 'يوجد هذا البريد من قبل' }),
        { headers: { 'content-type': 'application/json' }, status: 400 }
      );
    } else {
      const insertQuery = `
      INSERT INTO tb_students (name, surname, major, email, password, phone, address,birth_date,number, enrollement_date)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
      const insertValues = [
        data.name,
        data.surname,
        data.major,
        data.email,
        data.password,
        data.phone,
        data.address,
        data.birth_date,
        data.number,
        data.enrollement_date,
      ];

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

      return new Response(
        JSON.stringify({ message: 'تم تسجيل الحساب بنجاح' }),
        {
          headers: { 'content-type': 'application/json' },
        }
      );
    }
   
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تسجيل الحساب' }),
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
