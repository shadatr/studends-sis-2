import { Client } from 'pg';
import { MajorType } from '@/app/types/types';


export async function POST(request: Request) {
  const newData: MajorType[] = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    await client.connect();

    for (const data of newData) {
      const updateQuery = `UPDATE tb_majors SET major_name = $1, department_id = $2, credits_needed = $3, active = $4 WHERE id = $5`;
      const updateValues = [
        data.major_name,
        data.department_id,
        data.credits_needed,
        data.active,
        data.id,
      ];

      await client.query(updateQuery, updateValues);
    }

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم تحديث البيانات بنجاح' }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تحديث البيانات' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
