import { SectionType } from '@/app/types/types';
import { Client } from 'pg';

export async function POST(request: Request) {
  const data: SectionType = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
    await client.connect();

    const query = `
      INSERT INTO tb_section (id, course_id, name, students_num)
      VALUES ($1, $2, $3, $4)
    `;
    const values = [
      data.id,
      data.course_id,
      data.name,
      data.students_num,
    ];

    await client.query(query, values);

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم تسجيل المجموعة بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تسجيل المجموعة' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
