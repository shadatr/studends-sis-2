import { Client } from 'pg';

export async function POST(request: Request) {
  const data = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();

    const updateQuery = `UPDATE tb_students SET credits = $1, can_graduate = $2, graduation_year = $3 WHERE id = $4`;
    const updateParams = [
      data.credits,
      data.can_graduate,
      data.graduation_year,
      data.student_id,
    ];
    await client.query(updateQuery, updateParams);

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم تحديث البيانات بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تحديث البيانات' }),
      {
        headers: { 'content-type': 'application/json' },
        status: 400,
      }
    );
  }
}
