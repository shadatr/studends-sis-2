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

    const fetchCourseEnrollmentQuery = `SELECT * FROM tb_course_enrollment WHERE student_id = $1 AND approved = false`;
    const fetchClassesQuery = `SELECT * FROM tb_classes WHERE active = true`;
    const fetchSectionQuery = `SELECT * FROM tb_section`;
    const fetchCourseQuery = `SELECT * FROM tb_courses`;
    const fetchDoctorQuery = `SELECT * FROM tb_doctors`;

    const [
      courseEnrollmentResult,
      classesResult,
      sectionResult,
      courseResult,
      doctorResult,
    ] = await Promise.all([
      client.query(fetchCourseEnrollmentQuery, [params.id]),
      client.query(fetchClassesQuery),
      client.query(fetchSectionQuery),
      client.query(fetchCourseQuery),
      client.query(fetchDoctorQuery),
    ]);

    const courseEnrollments = courseEnrollmentResult.rows;
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
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
