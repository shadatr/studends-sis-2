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
      SELECT tb_majors.*, tb_departments.*
      FROM tb_majors
      INNER JOIN tb_departments ON tb_majors.department_id = tb_departments.id
    `;

    const result = await client.query(query);
    const data = result.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: 'An error occurred while retrieving the data',
      }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
    await client.connect();

    const { majorId, active } = await request.json();

    const updateQuery = `
      UPDATE tb_majors
      SET active = $1
      WHERE id = $2
    `;
    const updateValues = [active, majorId];

    await client.query(updateQuery, updateValues);

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم تغيير حالة التخصص بنجاح' }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تحديث حالة التخصص' }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }
}
