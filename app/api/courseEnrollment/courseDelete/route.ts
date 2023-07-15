import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function GET() {
  try {
    await client.connect();

    const query = `
      SELECT * FROM tb_course_enrollment
    `;

    const result = await client.query(query);
    const data = result.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'an error occured' }), {
      status: 403,
    });
  }
}

export async function POST(request: Request) {
  const data = await request.json();

  try {
    await client.connect();

    const deleteQuery = `
      DELETE FROM tb_course_enrollment
      WHERE id = $1
    `;
    const deleteValues = [data.id];

    const deleteResult = await client.query(deleteQuery, deleteValues);

    await client.end();

    if (deleteResult.rowCount === 0) {
      return new Response(JSON.stringify({ message: 'لا يمكنك مسح المادة' }), {
        headers: { 'content-type': 'application/json' },
        status: 400,
      });
    }

    return new Response(JSON.stringify({ message: 'تم مسح المادة بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء مسح المادة' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
