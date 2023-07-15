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

    const updateValues = { [data.name]: data.value };
    const updateQuery = `UPDATE tb_students SET ${data.name} = $1 WHERE id = $2`;
    const updateParams = [updateValues, data.student_id];
    await client.query(updateQuery, updateParams);

    if (data.name === 'graduated' && data.value === true) {
      const inactiveQuery =
        'UPDATE tb_students SET active = false WHERE id = $1';
      const inactiveParams = [data.student_id];
      await client.query(inactiveQuery, inactiveParams);
    }

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم الموافقة على الطلاب بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: 'هناك مشكلة' }), {
      headers: { 'content-type': 'application/json' },
      status: 400,
    });
  }
}
