import { Client } from 'pg';
import { PersonalInfoType } from '@/app/types/types';


export async function POST(
  request: Request,
  { params }: { params: { id: number } }
) {
  // TODO: Maybe add some validation for security here

  const newData: PersonalInfoType = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
    await client.connect();

    const updateQuery = `
      UPDATE tb_students
      SET
        name = $1,
        surname = $2,
        address = $3,
        phone = $4,
        email = $5,
        birth_date = $6,
        semester = $7,
        enrollment_date = $8,
        major = $9,
        advisor = $10,
        active = $11,
        graduated = $12,
        graduation_year = $13,
        can_graduate = $14,
        number = $15,
        graduate_advisor_approval = $16,
        final_gpa = $17
      WHERE id = $18
    `;
    const updateValues = [
      newData.name,
      newData.surname,
      newData.address,
      newData.phone,
      newData.email,
      newData.birth_date,
      newData.semester,
      newData.enrollment_date,
      newData.major,
      newData.advisor,
      newData.active,
      newData.graduated,
      newData.graduation_year,
      newData.can_graduate,
      newData.number,
      newData.graduate_advisor_approval,
      newData.final_gpa,
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
