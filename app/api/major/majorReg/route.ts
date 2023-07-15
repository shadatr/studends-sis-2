import { Client } from 'pg';
import { MajorRegType } from '@/app/types/types';

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

    const data: MajorRegType = await request.json();

    const insertQuery = `
      INSERT INTO tb_majors (major_name, department_id, credits_needed)
      VALUES ($1, $2, $3)
    `;
    const insertValues = [
      data.major_name,
      data.department_id,
      data.credits_needed,
    ];

    await client.query(insertQuery, insertValues);

    await client.end();

    return new Response(JSON.stringify({ message: 'تم تسجيل التخصص بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تسجيل التخصص' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET() {
  try {
    await client.connect();

    const selectQuery = 'SELECT * FROM tb_majors';

    const result = await client.query(selectQuery);
    const data = result.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 403,
    });
  }
}
