import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST(request: Request) {
  const data: AddCourseType = await request.json();
  
  try {
    await supabase.from('tb_courses').insert([data]);
    const course= await supabase
      .from('tb_courses')
      .select('*').eq("course_name",data.course_name);

      if (course.data && course.data.length > 0) {
        const res = course.data[0];
        const data2 = {
          name: res.course_name + `(مجموعة1)`,
          course_id: res.id,
        };
        await supabase.from('tb_section').insert([data2]);
      } else {
        return new Response(
          JSON.stringify({ message: 'حدث خطأ اثناء تسجيل المادة' }),
          { headers: { 'content-type': 'application/json' }, status: 400 }
        );
      }
   
    return new Response(JSON.stringify({ message: 'تم تسجيل المادة بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error occurred:', error);
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تسجيل المادة' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}

export async function GET() {
  try {
    await client.connect();

    const queryResult = await client.query('SELECT * FROM tb_courses');

    const data = queryResult.rows;

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error occurred:', error);
    return new Response(JSON.stringify({ message: 'an error occured' }), {
      headers: { 'content-type': 'application/json' },
      status: 403,
    });
  }
}
