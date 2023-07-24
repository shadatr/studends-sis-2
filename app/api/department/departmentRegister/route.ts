import { DepartmentRegType } from '@/app/types/types';
import { Client } from 'pg';




export async function POST(request: Request) {

  const data: DepartmentRegType = await request.json();

  try {

    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();

    await client.query(
      'INSERT INTO tb_departments (name) VALUES ($1)',
      [data.name]
    );

    await client.end();
    return new Response(JSON.stringify({ message: "تم تسجيل الكلية بنجاح"}), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء تسجيل الكلية' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}


export async function GET() {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
    const queryResult = await client.query(
      'SELECT * FROM tb_students'
    );

    if (queryResult.rowCount === 0) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: queryResult.rows }));
  } catch {}
}

