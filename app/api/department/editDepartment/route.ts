import { Client } from 'pg';
import { DepartmentRegType } from '@/app/types/types';

export async function POST(request: Request) {
  const newData: DepartmentRegType[] = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();

    const updateQueries = newData.map((data) => {
      const updateQuery = `
        UPDATE tb_departments
        SET name = $1, description = $2, active = $3
        WHERE id = $4
      `;
      const updateValues = [data.name, data.active, data.id];
      return client.query(updateQuery, updateValues);
    });

    await Promise.all(updateQueries);

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم تحديث البيانات بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تحديث البيانات' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
