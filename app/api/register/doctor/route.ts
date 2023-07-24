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
<<<<<<< HEAD
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
=======
    const doctors = await supabase
      .from('tb_doctors')
      .select('*')
      .eq('email', data.email);

    if (doctors.data && doctors.data.length > 0) {
      return new Response(
        JSON.stringify({ message: 'يوجد هذا البريد من قبل' }),
        {
          headers: { 'content-type': 'application/json' },
          status: 400,
        }
      );
    } else {
      await supabase.from('tb_doctors').insert([data]);
      
      const doctors = await supabase
        .from('tb_doctors')
        .select('*')
        .eq('email', data.email);

      const doctor = doctors.data;
      if (doctor) {
        const data1 = {
          permission_id: 21,
          doctor_id: doctor[0].id,
        };
        await supabase.from('tb_doctor_perms').insert([data1]);
      }

      return new Response(
        JSON.stringify({ message: 'تم تسجيل الحساب بنجاح' }),
        {
          headers: { 'content-type': 'application/json' },
        }
      );
    }
>>>>>>> c89937b3b40845b90f7474c63f0891238bded96b
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
<<<<<<< HEAD
    await client.connect();
=======
    const data = await supabase.from('tb_doctors').select('*');
    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }
>>>>>>> c89937b3b40845b90f7474c63f0891238bded96b

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
