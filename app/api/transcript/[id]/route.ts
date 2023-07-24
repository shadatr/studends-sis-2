import { TranscriptType } from '@/app/types/types';
import { Client } from 'pg';

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
    await client.connect();

    const query = 'SELECT * FROM tb_transcript WHERE student_id = $1';
    const values = [params.id];
    const result = await client.query(query, values);

    await client.end();

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ message: 'an error occurred' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: result.rows }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  const data: TranscriptType = await request.json();

  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
    await client.connect();

    const insertQuery =
      'INSERT INTO tb_transcript (gpa, semester, student_id, credits) VALUES ($1, $2, $3, $4)';
    const insertValues = [
      data.gpa,
      data.semester,
      data.student_id,
      data.credits,
    ];
    await client.query(insertQuery, insertValues);

    const updateQuery = 'UPDATE tb_students SET semester = $1 WHERE id = $2';
    const updateValues = [data.studentSemester + 1, data.student_id];
    await client.query(updateQuery, updateValues);

    const updateClassesQuery =
      'UPDATE tb_classes SET active = false WHERE semester = $1';
    const updateClassesValues = [data.semester];
    await client.query(updateClassesQuery, updateClassesValues);

    await client.end();

    return new Response(JSON.stringify({ message: 'success' }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'an error occurred' }), {
      status: 500,
    });
  }
}
