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
    
    const dataCourseEnroll = supabase.from('tb_course_enrollment').select('*').eq('student_id', params.id).eq('approved',true);
    
    const dataClasses = await supabase.from('tb_classes').select('*').eq('active', true);
    
    const dataSection = supabase.from('tb_section').select('*');

    const dataCourse = supabase.from('tb_courses').select('*');

    const dataDoctor = await supabase.from('tb_doctors').select('*');


    const [
      courseEnrollResponse,
      classResponse,
      sectionResponse,
      courseResponse,
      doctorResopnse,
    ] = await Promise.all([
      dataCourseEnroll,
      dataClasses,
      dataSection,
      dataCourse,
      dataDoctor
    ]);

    const classes = classResponse.data;
    const courseEnrollements = courseEnrollResponse.data;
    const sections = sectionResponse.data;
    const courses = courseResponse.data;
    const doctors = doctorResopnse.data;

    const data = courseEnrollements?.map((course) => {

      const clas = classes?.find((cl) => cl.id== course.class_id);

      const secInfo = sections?.find((sec) => sec.id==clas?.section_id);

      const doc = doctors?.find((co) =>clas?.doctor_id== co.id );

      const cour = courses?.find((c) => secInfo?.course_id === c.id);


      return {
        class: clas,
        course: cour,
        courseEnrollements: course,
        section: secInfo,
        doctor: doc,
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
