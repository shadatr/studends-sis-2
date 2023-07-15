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

    const courseEnrollQuery = `SELECT * FROM tb_course_enrollment WHERE student_id = ${params.id} AND approved = true`;
    const classesQuery = `SELECT * FROM tb_classes WHERE active = true`;
    const sectionQuery = `SELECT * FROM tb_section`;
    const courseQuery = `SELECT * FROM tb_courses`;
    const doctorQuery = `SELECT * FROM tb_doctors`;

    const [
      courseEnrollResult,
      classesResult,
      sectionResult,
      courseResult,
      doctorResult,
    ] = await Promise.all([
      client.query(courseEnrollQuery),
      client.query(classesQuery),
      client.query(sectionQuery),
      client.query(courseQuery),
      client.query(doctorQuery),
    ]);

    const courseEnrollments = courseEnrollResult.rows;
    const classes = classesResult.rows;
    const sections = sectionResult.rows;
    const courses = courseResult.rows;
    const doctors = doctorResult.rows;

    const data = courseEnrollments.map((course) => {
      const clas = classes.find((cl) => cl.id === course.class_id);
      const secInfo = sections.find((sec) => sec.id === clas.section_id);
      const doc = doctors.find((co) => clas.doctor_id === co.id);
      const cour = courses.find((c) => secInfo.course_id === c.id);

      return {
        class: clas,
        course: cour,
        courseEnrollments: course,
        section: secInfo,
        doctor: doc,
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
