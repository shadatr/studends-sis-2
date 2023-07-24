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
    const dataClass = supabase
      .from('tb_classes')
      .select('*')
      .eq('section_id', params.id).eq('active', true);

    const dataSection = supabase
      .from('tb_section')
      .select('*')
      .eq('id', params.id);

    const dataDoctors = await supabase.from('tb_doctors').select('*');

    const dataCourse = await supabase.from('tb_courses').select('*');

     const dataCourseEnroll = await supabase.from('tb_course_enrollment').select('*');

    const [
      classResponse,
      sectionResponse,
      courseResponse,
      doctorResponse,
      CourseEnrollResopnese
    ] = await Promise.all([
      dataClass,
      dataSection,
      dataDoctors,
      dataCourse,
      dataCourseEnroll,
    ]);
    
    const classes = classResponse.data;
    const sections = sectionResponse.data;
    const doctors = courseResponse.data;
    const courses = doctorResponse.data;
    const CourseEnrolls = CourseEnrollResopnese.data;

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

    const req = await request.json();
    const deleteReq = await supabase.from('tb_classes').delete().eq('id', req);
    if(deleteReq.error){return new Response(
      JSON.stringify({ message: 'لا يمكنك حذف هذه المحاضرة ، يوجد طلاب مشتركين' }),
      {
        status: 500,
      }
    );}

    return new Response(JSON.stringify({ message: 'تم حذف المحاضرة بنجاح' }));

}

