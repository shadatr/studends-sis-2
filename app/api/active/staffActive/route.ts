import { Client } from 'pg';

export async function POST(request: Request) {
  const { adminId, active } = await request.json();
  console.log('adminId', adminId, 'active', active);

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    await client.connect();

    const queryResult = await client.query(
      'UPDATE tb_admins SET active = $1 WHERE id = $2 RETURNING id',
      [active, adminId]
    );

    await client.end();

    if (queryResult.rowCount === 0) {
      return new Response(
        JSON.stringify({ message: 'No matching rows found' }),
        {
          headers: { 'content-type': 'application/json' },
          status: 400,
        }
      );
    }

    return new Response(
      JSON.stringify({ message: 'تم تغيير حالة الموظف بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error occurred:', error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تغيير حالة الموظف' }),
      {
        headers: { 'content-type': 'application/json' },
        status: 400,
      }
    );
  }
}
