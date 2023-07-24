import { Client } from 'pg';

const client = new Client({
  user: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  database: process.env.DB_NAME || '',
  port: Number(process.env.DB_PORT),
});

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    await client.connect();

    const classQuery = `SELECT * FROM tb_classes WHERE section_id = $1 AND active = true`;
    const classValues = [params.id];
    const classResult = await client.query(classQuery, classValues);
    const classes = classResult.rows;

    const sectionQuery = `SELECT * FROM tb_section WHERE id = $1`;
    const sectionValues = [params.id];
    const sectionResult = await client.query(sectionQuery, sectionValues);
    const sections = sectionResult.rows;

    const doctorQuery = `SELECT * FROM tb_doctors`;
    const doctorResult = await client.query(doctorQuery);
    const doctors = doctorResult.rows;

    const courseQuery = `SELECT * FROM tb_doctors`;
    const courseResult = await client.query(courseQuery);
    const courses = courseResult.rows;

    const courseEnrollQuery = `SELECT * FROM tb_doctors`;
    const courseEnrollResult = await client.query(courseEnrollQuery);
    const CourseEnrolls = courseEnrollResult.rows;


    const data = classes?.map((cls) => {
      const secInfo = sections?.find((sec) => cls.section_id === sec.id);
      const docto = doctors?.find((doc) => doc.id === cls.doctor_id);
      const cours = courses?.find((co) => co.id === secInfo?.course_id);
      const coursEnr = CourseEnrolls?.filter((co) => co.class_id === cls.id);
      return {
        class: cls,
        course: cours,
        doctor: docto,
        section: secInfo,
        courseEnrollements: coursEnr
      };
    });

    await client.end();

    return new Response(JSON.stringify({ message: data }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    const req = await request.json();

    const classId = req;

    await client.connect();

    const studentQuery = `SELECT * FROM tb_course_enrollment WHERE class_id = $1`;
    const studentValues = [classId];
    const studentResult = await client.query(studentQuery, studentValues);
    const students = studentResult.rows;

    if (students.length > 0) {
      await client.end();
      return new Response(
        JSON.stringify({
          message: 'لا يمكنك حذف هذه المحاضرة ، يوجد طلاب مشتركين',
        }),
        { status: 500 }
      );
    }

    const deleteQuery = `DELETE FROM tb_classes WHERE id = $1`;
    const deleteValues = [classId];
    await client.query(deleteQuery, deleteValues);

    await client.end();

    return new Response(JSON.stringify({ message: 'تم حذف المحاضرة بنجاح' }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}
