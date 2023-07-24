import { createClient } from '@supabase/supabase-js';
import {DepartmentRegType} from '@/app/types/types';
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(
  request: Request,
) {
  // TODO: Maybe add some validation for security here

  const newData: DepartmentRegType[] = await request.json();

  try {
    newData.map(async (data) => {
      const updatePromises = await supabase.from('tb_departments').update(data).eq('id', data.id);
      console.log(updatePromises.error?.message);
    });


    return new Response(
      JSON.stringify({ message: 'تم تحديث البيانات بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    // send a 400 response with an error happened during update in Arabic
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تحديث البيانات' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
