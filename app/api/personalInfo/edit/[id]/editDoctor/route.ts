import { Client } from 'pg';
import { PersonalInfoType } from '@/app/types/types';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST(
  request: Request,
  { params }: { params: { id: number } }
) {
  // TODO: Maybe add some validation for security here

  const newData: PersonalInfoType = await request.json();

  try {
    await client.connect();

    const updateQuery = `
      UPDATE tb_doctors
      SET name = $1, surname = $2, address = $3, phone = $4, email = $5, birth_date = $6, major =$7,
      WHERE id = $8
    `;
    const updateValues = [
      newData.name,
      newData.surname,
      newData.address,
      newData.phone,
      newData.email,
      newData.birth_date,
      newData.major,
      params.id,
    ];

    await client.query(updateQuery, updateValues);

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم تحديث البيانات بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    // send a 400 response with an error happened during update in Arabic
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تحديث البيانات' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
