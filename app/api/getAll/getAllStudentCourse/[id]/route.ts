import { CourseInfoType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const dataCourse = supabase.from('tb_courses').select('*');

    const dataMajorCourse = supabase
      .from('tb_major_courses')
      .select('*')
      .eq('major_id', params.id);

    const dataSection = supabase.from('tb_section').select('*');

    const dataClasses = await supabase.from('tb_classes').select('*');

    const dataCourseEnroll = await supabase
      .from('tb_course_enrollments')
      .select('*');

    const dataCoursePrerequisties = await supabase
      .from('tb_prerequisites_courses')
      .select('*');

    const [
      classResponse,
      courseEnrollResponse,
      sectionResponse,
      courseResponse,
      coursePrerequistiesResoponse,
      majorCourseResponse,
    ] = await Promise.all([
      dataClasses,
      dataCourseEnroll,
      dataSection,
      dataCourse,
      dataCoursePrerequisties,
      dataMajorCourse,
    ]);

    const classes = classResponse.data;
    const courseEnrollements = courseEnrollResponse.data;
    const sections = sectionResponse.data;
    const courses = courseResponse.data;
    const coursePrerequisties = coursePrerequistiesResoponse.data;
    const majorCourses = majorCourseResponse.data;

    const data = majorCourses?.map((course) => {
      const coPre = coursePrerequisties?.filter(
        (co) => co.course_id == course.course_id
      );
      const secInfo = sections?.filter(
        (sec) => course.course_id === sec.course_id
      );
      const clas = classes?.filter((cl) =>
        secInfo?.some((sc) => cl.section_id === sc.id)
      );
      const coEnroll = courseEnrollements?.filter((co) =>
        clas?.some((cl) => co.class_id === cl.id)
      );
      const cour = courses?.find((c) => course.course_id === c.id);

      console.log(clas);
      console.log(secInfo);

      return {
        class: clas,
        course: cour,
        courseEnrollements: coEnroll,
        section: secInfo,
        prerequisites: coPre,
        majorCourse: course,
      };
    });

    return new Response(JSON.stringify({ message: data }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}
