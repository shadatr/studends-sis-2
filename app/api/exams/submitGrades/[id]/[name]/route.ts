import { Client } from 'pg';

export async function POST(
  request: Request,
  { params }: { params: { id: number; name: string } }
) {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();

    const updateQuery = `
      UPDATE tb_classes
      SET ${params.name} = $1
      WHERE section_id = $2
    `;
    const updateValues = [request.body, params.id];
    await client.query(updateQuery, updateValues);

    await client.end();

    return new Response(JSON.stringify({ message: 'تم حذف الاعلان بنجاح' }));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}
