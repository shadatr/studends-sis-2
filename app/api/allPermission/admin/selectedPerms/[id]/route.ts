import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST(request: Request) {
  const { id, parmId, active } = await request.json();

  try {
    await client.connect();

     await client.query(
      'UPDATE tb_admin_perms SET active = $1 WHERE permission_id = $2 AND admin_id = $3',
      [active, id, parmId]
    );

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم تغيير حالة صلاحية الموظف بنجاح' }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {

    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تغيير حالة صلاحية الموظف' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    await client.connect();

    const queryResult = await client.query(
      'SELECT * FROM tb_admin_perms WHERE admin_id = $1',
      [params.id]
    );

    await client.end();

    if (queryResult.rowCount === 0) {
      return new Response(JSON.stringify({ message: 'No data found' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: queryResult.rows }));
  } catch (error) {

    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 403,
    });
  }
}
