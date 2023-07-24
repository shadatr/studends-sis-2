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

    const doctors = `SELECT * FROM tb_doctors WHERE email = ${data.email} `;
    const fetchResult = await client.query(doctors);

    if (fetchResult.rows && fetchResult.rows.length > 0) {
      return new Response(
        JSON.stringify({ message: 'يوجد هذا البريد من قبل' }),
        { headers: { 'content-type': 'application/json' }, status: 400 }
      );
    }

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
    console.log(error);
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
