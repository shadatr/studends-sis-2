import { createClient } from '@supabase/supabase-js';
import { StudentClassType } from '@/app/types/types';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(
  request: Request,
  { params }: { params: { id: number; name: string } }
) {

  const data1 = await request.json();

  const res = await Promise.all(
    data1.map(async (item: StudentClassType) => {
      const data = await supabase
        .from('tb_course_enrollment')
        .update([item])
        .eq('id', item.id)
        .eq('student_id', params.id);
      return data;
    })
  );
  console.log(res);
  return new Response(JSON.stringify({ message: 'تم حذف الاعلان بنجاح' }));
}
