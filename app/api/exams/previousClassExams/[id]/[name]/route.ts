import { ClassesType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function GET(
  request: Request,
  { params }: { params: { id: number, name: string } }
) {
  try {
    const data = await supabase
      .from('tb_classes')
      .select('*')
      .eq('section_id', params.id)
      .eq('semester', params.name);

      
      const parsedData = JSON.parse(JSON.stringify(data));
      const messageData = parsedData.data;
      const data3: ClassesType[] = messageData;

      const data1 = await supabase
      .from('tb_course_enrollment')
      .select('*')
      .eq('class_id', data3[0].id);

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data1.data }));
  } catch {}
}
