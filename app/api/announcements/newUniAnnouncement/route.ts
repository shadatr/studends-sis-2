import { Client } from 'pg';
import { AnnouncmentsMangType } from '@/app/types/types';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST(request: Request) {
  try {
    await client.connect();

    const data: AnnouncmentsMangType = await request.json();

    await client.query(
      'INSERT INTO tb_announcements (announcement_text, general) VALUES ($1, $2)',
      [data.announcement_text, data.general]
    );

    await client.end();

    return new Response(JSON.stringify({ message: 'تم  نشر الاعلان بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error occurred:', error);

    return new Response(
      JSON.stringify({ message: 'هناك مشكلة، لم يتم نشر الاعلان' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
