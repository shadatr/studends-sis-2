import { Client } from 'pg';
import { GetPermissionType } from '@/app/types/types';



export async function POST(request: Request) {
  const data: GetPermissionType[] = await request.json();

  const client = new Client({
    user: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    port: Number(process.env.DB_PORT),
  });
  try {
    await client.connect();

    const updates = data.map(async (i) => {
      try {
        // Update records in tb_admin_perms based on permission_id and id
        const updateQuery = `
          UPDATE tb_admin_perms 
          SET see = $1, edit = $2 , approve= $3, add=$4, Delete=$5
          WHERE permission_id = $6 AND id = $7
          RETURNING *;
        `;

        const values = [
          i.see, // Replace with the actual value for column1
          i.edit,
          i.approve,
          i.add,
          i.Delete,
          i.permission_id,
          i.id,
        ];

        const result = await client.query(updateQuery, values);

        console.log(result.rows); // Log the updated rows to the console

        return result;
      } catch (error) {
        return { error };
      }
    });

    await Promise.all(updates);

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم تغيير حالة صلاحية الموظف بنجاح' }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تغيير حالة صلاحية الموظف' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT),
    });
    await client.connect();

    // Retrieve records from tb_admin_perms based on admin_id
    const query = `
      SELECT *
      FROM tb_admin_perms
      WHERE admin_id = $1
      ORDER BY id DESC;
    `;

    const values = [params.id];

    const result = await client.query(query, values);

    const data = result.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء استعلام صلاحية الموظف' }),
      { headers: { 'content-type': 'application/json' }, status: 403 }
    );
  }
}
