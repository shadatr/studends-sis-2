import { ClassesType } from '@/app/types/types';
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
    const data = await supabase
      .from('tb_classes')
      .select('*')
      .eq('section_id', params.id);

    const parsedData = JSON.parse(JSON.stringify(data));
    const messageData = parsedData.data;
    const data3: ClassesType[] = messageData;

    const data2 = await supabase
      .from('tb_course_enrollment')
      .select('*')
      .eq('class_id', data3[0].id);

    console.log(data2.data);
    console.log(data2.error?.message);
    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data2.data }));
  } catch {}
}
