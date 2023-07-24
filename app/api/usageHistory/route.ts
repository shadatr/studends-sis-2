import { Client } from 'pg';


export async function POST(request: Request) {
  const client = new Client({
    user: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    port: Number(process.env.DB_PORT),
  });

  const data = await request.json();

  const currentDate = new Date();
  const currentDateValue = currentDate.toISOString().split('T')[0];
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;

  try {
    await client.connect();

    const insertQuery = `INSERT INTO tb_usage_history (user_id, action, type, date) VALUES ($1, $2, $3, $4)`;
    const insertValues = [
      data.id,
      data.action,
      data.type,
      currentDateValue + ' / ' + formattedTime,
    ];
    await client.query(insertQuery, insertValues);

    await client.end();

    return new Response(
      JSON.stringify({ message: 'تم إدخال البيانات بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء إدخال البيانات' }),
      {
        headers: { 'content-type': 'application/json' },
        status: 400,
      }
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
    
    await client.connect();

    const selectQuery = `SELECT * FROM tb_usage_history ORDER BY id DESC`;
    const result = await client.query(selectQuery);
    const data = result.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء استعلام البيانات' }),
      {
        headers: { 'content-type': 'application/json' },
        status: 400,
      }
    );
  }
}
