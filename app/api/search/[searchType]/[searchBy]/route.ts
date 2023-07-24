import { Client } from 'pg';

export async function GET(
  request: Request,
  { params }: { params: { searchType: string; searchBy: string } }
) {
  const tableName = `tb_${params.searchType}`;
  const searchBy = params.searchBy.trim();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
    await client.connect();

    let data;

    if (!isNaN(Number(searchBy))) {
      const query = `SELECT * FROM ${tableName} WHERE number = $1`;
      const values = [searchBy];
      data = await client.query(query, values);
    } else {
      const query = `SELECT * FROM ${tableName} WHERE name ILIKE $1`;
      const values = [`%${searchBy}%`];
      data = await client.query(query, values);
    }

    await client.end();

    if (data.rowCount === 0) {
      return new Response(JSON.stringify({ message: 'لا يوجد نتائج' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: data.rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'حدث خطأ أثناء البحث' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
