import { createClient } from '@supabase/supabase-js';
import {  StudentClassType } from '@/app/types/types';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

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

    if (classes && sections) {
      
      const { data: courseEnrollments } = await supabase
        .from('tb_course_enrollment')
        .select('*')
        .eq('approved', true)
        .eq('class_id', classes[0].id).order('id', { ascending: false });
  
      const { data: course } = await supabase
        .from('tb_courses')
        .select('*')
        .eq('id', sections[0].course_id);
  
        
        const data = {
          courseEnrollements: courseEnrollments,
          course: course,
          section: sections,
          class: classes
        };
  
      return new Response(JSON.stringify({ message: data }), {
        status: 200,
        headers: { revalidate: dynamic },
      });
    }else{ console.log("not found");}

  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}

export async function POST(
  request: Request
) {

  const data1 = await request.json();

  const res=await Promise.all(
    data1.map(async (item: StudentClassType) => {
      const data = await supabase
        .from('tb_course_enrollment')
        .update([item])
        .eq('student_id', item.student_id)
        .eq('class_id', item.class_id);
      return data;
    })
  );
  console.log(res);
  return new Response(JSON.stringify({ message: 'تم حذف الاعلان بنجاح' }));
}
