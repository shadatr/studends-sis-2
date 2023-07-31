import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {

    const dataStudent = supabase.from('tb_students').select('*').eq('id', params.id);
    
    const dataCourseEnroll = supabase.from('tb_course_enrollment').select('*').eq('student_id', params.id).eq('approved',true);
    
    const dataClasses = await supabase.from('tb_classes').select('*');
    
    const dataSection = supabase.from('tb_section').select('*');

    const dataCourse = supabase.from('tb_courses').select('*');

    const dataMajor = supabase.from('tb_majors').select('*');

    const dataDep = supabase.from('tb_departments').select('*');

    const dataDoctor = await supabase.from('tb_doctors').select('*');


    const [
      courseEnrollResponse,
      classResponse,
      sectionResponse,
      courseResponse,
      doctorResopnse,
      studentResponse,
      majorResponse,
      depResponse,
    ] = await Promise.all([
      dataCourseEnroll,
      dataClasses,
      dataSection,
      dataCourse,
      dataDoctor,
      dataStudent,
      dataMajor,
      dataDep,
    ]);

    const classes = classResponse.data;
    const courseEnrollements = courseEnrollResponse.data;
    const sections = sectionResponse.data;
    const courses = courseResponse.data;
    const doctors = doctorResopnse.data;
    const student = studentResponse.data;
    const major = majorResponse.data;
    const dep = depResponse.data;

    const data = courseEnrollements?.map((course) => {

      const clas = classes?.find((cl) => cl.id== course.class_id);

      const secInfo = sections?.find((sec) => sec.id==clas?.section_id);

      const doc = doctors?.find((co) =>clas?.doctor_id== co.id );

      const cour = courses?.find((c) => secInfo?.course_id === c.id);

      const stu = student?.find((c) => c.id);

      const maj = major?.find((c) => stu?.major === c.id);

      const de = dep?.find((c) => stu?.department_id === c.id);

      return {
        class: clas,
        course: cour,
        courseEnrollements: course,
        section: secInfo,
        doctor: doc,
        student: stu,
        major:maj,
        department:de
      };
    });

    return new Response(JSON.stringify({ message: data }), {
      status: 200,
      headers: { revalidate: dynamic },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}
