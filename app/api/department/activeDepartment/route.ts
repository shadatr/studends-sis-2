import { Client } from 'pg';

export async function POST(request: Request) {
  const { depId, active } = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    }); 
    
    await client.connect();

    const departmentUpdateQuery = `
      UPDATE tb_departments
      SET active = $1
      WHERE id = $2
    `;
    const departmentUpdateValues = [active, depId];

    const departmentUpdateResult = await client.query(
      departmentUpdateQuery,
      departmentUpdateValues
    );

    const majorUpdateQuery = `
      UPDATE tb_majors
      SET active = $1
      WHERE department_id = $2
    `;
    const majorUpdateValues = [active, depId];

    const majorUpdateResult = await client.query(
      majorUpdateQuery,
      majorUpdateValues
    );

    await client.end();

    if (departmentUpdateResult.rowCount > 0 && majorUpdateResult.rowCount > 0) {
      return new Response(
        JSON.stringify({ message: 'تم تغيير حالة القسم بنجاح' }),
        {
          headers: { 'content-type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ message: 'حدث خطأ أثناء تغيير حالة القسم' }),
        { headers: { 'content-type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تغيير حالة القسم' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
