import { Client } from 'pg';
import { StudentClassType } from '@/app/types/types';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function POST(request: Request) {
  const data: StudentClassType = await request.json();

  try {
<<<<<<< HEAD
    await client.connect();

    const query = `
      INSERT INTO tb_course_enrollment (
        student_id,
        class_id,
        semester,
        class_work,
        midterm,
        final,
        pass,
        result,
        can_repeat,
        approved
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    const values = [
      data.student_id,
      data.class_id,
      data.semester,
      data.class_work,
      data.midterm,
      data.final,
      data.pass,
      data.result,
      data.can_repeat,
      data.approved,
    ];
    await client.query(query, values);

    await client.end();
=======
    await supabase.from('tb_course_enrollment').insert([data]);

    const enrollment = await supabase
      .from('tb_course_enrollment')
      .select('*')
      .eq('class_id', data.class_id)
      .eq('student_id', data.student_id);

    const course = enrollment.data;

    if (course) {
      const data2 = {
        course_enrollment_id: course[0].id,
      };
      const res = await supabase.from('tb_grades').insert([data2]);
      console.log(res);
    }
>>>>>>> c89937b3b40845b90f7474c63f0891238bded96b

    return new Response(JSON.stringify({ message: 'تم ارسال المواد بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'حدث خطأ اثناء ارسال المواد' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
