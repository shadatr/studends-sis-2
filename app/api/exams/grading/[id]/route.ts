import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    await client.connect();

    const query = `
      SELECT *
      FROM tb_letter_grades
      WHERE id = $1
    `;
    const values = [params.id];

    const result = await client.query(query, values);
    const data = result.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: number } }
) {
  const data = await request.json();

  try {
    await client.connect();

    const query = `
      UPDATE tb_letter_grades
      SET
        col1 = $1,
        col2 = $2,
        ...
      WHERE id = $3
    `;
    const values = [data.col1, data.col2, params.id];

    const result = await client.query(query, values);

    await client.end();

    return new Response(JSON.stringify({ message: 'تم حذف الاعلان بنجاح' }));
  } catch (error) {
    console.error(error);
    await client.end();
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تحديث البيانات' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
