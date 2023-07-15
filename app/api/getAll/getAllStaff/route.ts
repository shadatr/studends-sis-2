import { Client } from 'pg';
import { AdminStaffType } from '@/app/types/types';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function GET() {
  try {
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

    return new Response(JSON.stringify({ message: resp }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}
