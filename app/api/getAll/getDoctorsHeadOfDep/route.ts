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

    const doctorsQuery = 'SELECT * FROM tb_doctors ORDER BY id';
    const departmentsQuery = 'SELECT * FROM tb_departments';

    const [doctorsResult, departmentsResult] = await Promise.all([
      client.query(doctorsQuery),
      client.query(departmentsQuery),
    ]);

    const doctors = doctorsResult.rows;
    const departments = departmentsResult.rows;

    const data = doctors.map((doctor) => {
      const department = departments.find(
        (department) => department.id === doctor.head_of_deparment_id
      );
      return {
        id: doctor.id,
        name: doctor.name,
        surname: doctor.surname,
        doctorSince: doctor.enrollment_date,
        email: doctor.email,
        major: doctor.major,
        active: doctor.active,
        department: department,
      };
    });

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}
