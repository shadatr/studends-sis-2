import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function GET(
  request: Request,
  { params }: { params: { id: number, name:string } }
) {
  try {
    const dataClass = supabase
      .from('tb_classes')
      .select('*')
      .eq('section_id', params.id).eq('semester', params.name);

    const dataSection = supabase
      .from('tb_section')
      .select('*')
      .eq('id', params.id);

    const dataDoctors = await supabase.from('tb_doctors').select('*');

    const dataCourse = await supabase.from('tb_courses').select('*');

    const [classResponse, sectionResponse, courseResponse, doctorResponse] =await Promise.all([dataClass, dataSection, dataDoctors, dataCourse]);
    
    const classes = classResponse.data;
    const sections = sectionResponse.data;
    const doctors = courseResponse.data;
    const courses = doctorResponse.data;

    const data = classes?.map((cls) => {
      const secInfo = sections?.find((sec) => cls.section_id === sec.id);
      const docto = doctors?.find((doc) => doc.id === cls.doctor_id);
      const cours = courses?.find((co) => co.id === secInfo?.course_id);
      console.log(cours);
      return {
        class: cls,
        course: cours,
        doctor: docto,
        section: secInfo,
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