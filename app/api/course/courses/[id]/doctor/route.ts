import { ClassesType, Section2Type } from '@/app/types/types';
import { createClient, PostgrestResponse } from '@supabase/supabase-js';

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
    const data = await supabase
      .from('tb_classes')
      .select('*')
      .eq('doctor_id', params.id).('active', true);

    const parsedData = JSON.parse(JSON.stringify(data));
    const messageData = parsedData.data;
    const data3: ClassesType[] = messageData;

    const prerequisitePromises = data3.map(async (item) => {
      const response: PostgrestResponse<{ [key: string]: any }> = await supabase
        .from('tb_section')
        .select('*')
        .in('id', [item.section_id]); 

      const data2: { [key: string]: any }[] = response.data || [];

      return data2.map((sectionData) => ({
        class_id: item.id,
        id: sectionData.id,
        course_id: sectionData.course_id,
        name: sectionData.name,
        max_students: sectionData.max_students,
        students_num: sectionData.students_num,
      }));
    });

    const prerequisiteData = await Promise.all(prerequisitePromises);
    const prerequisites: Section2Type[] = prerequisiteData.flat();

    if (data.error) {
      return new Response(JSON.stringify({ message: 'An error occurred' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: prerequisites }), {
      status: 200,
      headers: { revalidate: dynamic },
    });
  } catch (error) {
    return new Response(null, { status: 500 });
  }
}
