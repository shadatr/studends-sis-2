import { Client } from 'pg';

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
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

    const fetchCourseQuery = 'SELECT * FROM tb_courses';
    const fetchMajorCourseQuery =
      'SELECT * FROM tb_major_courses WHERE major_id = $1';
    const fetchSectionQuery = 'SELECT * FROM tb_section';
    const fetchClassesQuery = 'SELECT * FROM tb_classes';
    const fetchCourseEnrollmentQuery = 'SELECT * FROM tb_course_enrollment';
    const fetchDoctorQuery = 'SELECT * FROM tb_doctors';
    const fetchCoursePrerequisitesQuery =
      'SELECT * FROM tb_prerequisites_courses';

    const [
      courseResult,
      majorCourseResult,
      sectionResult,
      classesResult,
      courseEnrollmentResult,
      doctorResult,
      coursePrerequisitesResult,
    ] = await Promise.all([
      client.query(fetchCourseQuery),
      client.query(fetchMajorCourseQuery, [params.id]),
      client.query(fetchSectionQuery),
      client.query(fetchClassesQuery),
      client.query(fetchCourseEnrollmentQuery),
      client.query(fetchDoctorQuery),
      client.query(fetchCoursePrerequisitesQuery),
    ]);

    const courses = courseResult.rows;
    const majorCourses = majorCourseResult.rows;
    const sections = sectionResult.rows;
    const classes = classesResult.rows;
    const courseEnrollments = courseEnrollmentResult.rows;
    const doctors = doctorResult.rows;
    const coursePrerequisites = coursePrerequisitesResult.rows;

    const data = majorCourses.map((course) => {
      const coPre = coursePrerequisites.filter(
        (co) => co.course_id === course.course_id
      );
      const secInfo = sections.filter(
        (sec) => course.course_id === sec.course_id
      );
      const clas = classes.filter((cl) =>
        secInfo.some((sc) => cl.section_id === sc.id)
      );
      const coEnroll = courseEnrollments.filter((co) =>
        clas.some((cl) => co.class_id === cl.id)
      );
      const doc = doctors.filter((co) =>
        clas.map((cl) => co.id === cl.doctor_id)
      );
      const cour = courses.find((c) => course.course_id === c.id);

      return {
        class: clas,
        course: cour,
        courseEnrollments: coEnroll,
        section: secInfo,
        prerequisites: coPre,
        majorCourse: course,
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
