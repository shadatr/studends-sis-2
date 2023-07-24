import { Client } from 'pg';
import { AdminStaffType } from '@/app/types/types';


export async function GET() {
  try {

    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();

    const query = 'SELECT * FROM tb_admins';
    const result = await client.query(query);

    await client.end();

    const resp: AdminStaffType[] = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      surname: row.surname,
      createdAt: row.enrollment_date,
      active: row.active,
    }));

    console.log(result.rows);

    return new Response(JSON.stringify({ message: result.rows }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}
