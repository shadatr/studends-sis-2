import { ClassesInfoType } from '@/app/types/types';
import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST(request: Request) {
  // TODO: Maybe add some validation for security here

  const newData: ClassesInfoType[] = await request.json();

  try {
    await client.connect();

    const updatePromises = newData.map(async (item) => {
      const query = `
        UPDATE tb_classes
        SET ... -- Specify the columns and values to update based on item.class
        WHERE id = $1
      `;
      const values = [item.class.id];

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
