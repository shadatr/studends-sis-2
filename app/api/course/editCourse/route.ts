import { DepartmentRegType } from '@/app/types/types';
import { Client } from 'pg';


export async function POST(request: Request) {
  // TODO: Maybe add some validation for security here

  const newData: DepartmentRegType[] = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    await client.connect();

    const updatePromises = newData.map(async (data) => {
      const query = `
        UPDATE tb_courses
        SET ... -- Specify the columns and values to update based on data
        WHERE id = $1
      `;
      const values = [data.id];

      await client.query(query, values);
    });

    await Promise.all(updatePromises);

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
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
