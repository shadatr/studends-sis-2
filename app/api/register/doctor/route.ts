import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST(request: Request) {
  const data = await request.json();

  try {
    await client.connect();

    const insertQuery = `INSERT INTO tb_doctors (name, surname) VALUES ($1, $2) RETURNING id`;
    const insertValues = [data.name, data.surname];
    const insertResult = await client.query(insertQuery, insertValues);
    const doctorId = insertResult.rows[0].id;

    const data1 = {
      permission_id: 21,
      doctor_id: doctorId,
    };

    const insertQuery2 = `INSERT INTO tb_doctor_perms (permission_id, doctor_id) VALUES ($1, $2)`;
    const insertValues2 = [data1.permission_id, data1.doctor_id];
    await client.query(insertQuery2, insertValues2);

    await client.end();

    return new Response(JSON.stringify({ message: 'تم تسجيل الحساب بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    // send a 400 response with an error happened during registration in Arabic
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تسجيل الحساب' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET() {
  try {
    await client.connect();

    const fetchQuery = `SELECT * FROM tb_doctors`;
    const fetchResult = await client.query(fetchQuery);
    const data = fetchResult.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'an error occured' }), {
      status: 403,
    });
  }
}
