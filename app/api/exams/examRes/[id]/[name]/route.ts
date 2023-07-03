import { createClient } from '@supabase/supabase-js';
import { ClassesType, StudentClassType } from '@/app/types/types';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function GET(
  request: Request,
  { params }: { params: { id: number; name: string } }
) {
  try {
    const { data: classes } = await supabase
      .from('tb_classes')
      .select('*')
      .eq('section_id', params.id)
      .eq('active', true);

    const { data: sections } = await supabase
      .from('tb_section')
      .select('*')
      .eq('id', params.id);

    // console.log(classes);

    if (classes && sections) {
      
      const { data: courseEnrollments } = await supabase
        .from('tb_course_enrollment')
        .select('*')
        .eq('approved', true)
        .eq('class_id', classes[0].id);
  
      const { data: course } = await supabase
        .from('tb_courses')
        .select('*')
        .eq('id', sections[0].course_id);
  
        
        const data = {
          courseEnrollements: courseEnrollments,
          course: course,
        };
        console.log(data);
  
      return new Response(JSON.stringify({ message: data }), {
        status: 200,
      });
    }else{ console.log("not found");}

  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: number; name: string } }
) {
  const data = await supabase
    .from('tb_classes')
    .select('*')
    .eq('section_id', params.id);

  const parsedData = JSON.parse(JSON.stringify(data));
  const messageData = parsedData.data;
  const data3: ClassesType[] = messageData;
  // console.log(data3);

  const data1 = await request.json();

  await Promise.all(
    data1.map(async (item: StudentClassType) => {
      const data = await supabase
        .from('tb_course_enrollment')
        .update([{ [params.name]: item[params.name] }])
        .eq('student_id', item.student_id)
        .eq('class_id', data3[0].id);
      return data;
    })
  );
  return new Response(JSON.stringify({ message: 'تم حذف الاعلان بنجاح' }));
}
