import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST(request: Request) {
  try {
    await client.connect();

    const data1 = await request.json();
    console.log(data1);

    const queryResult = await client.query(
      'UPDATE tb_student_perms SET active = $1 WHERE permission_id = $2 AND student_id = $3',
      [data1.active, data1.permission_id, data1.student_id]
    );

    await client.end();

    console.log(queryResult);

    return new Response(
      JSON.stringify({ message: 'تم تغيير حالة صلاحية الموظف بنجاح' }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error occurred:', error);

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
      'SELECT * FROM tb_student_perms WHERE student_id = $1',
      [params.id]
    );

    await client.end();

    console.log(queryResult);

    if (queryResult.rowCount === 0) {
      return new Response(JSON.stringify({ message: 'No data found' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: queryResult.rows }));
  } catch (error) {
    console.error('Error occurred:', error);

    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 403,
    });
  }
}
