import { AssignDepartmentType } from '@/app/types/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const body: AssignDepartmentType = await request.json();
  const res = await supabase
    .from('tb_doctors')
    .update({ head_of_department_id: body.department_id })
    .eq('id', body.doctor_id);
    console.log(res);

  return new Response(JSON.stringify({ message: 'تم تعيين القسم بنجاح' }), {
    headers: { 'content-type': 'application/json' },
  });
}
