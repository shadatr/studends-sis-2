import { AssignDepartmentType } from "@/app/types/types";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/app/types/supabase";

const supabase = createClient<Database>(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');

export async function POST(request: Request) {
  const body: AssignDepartmentType = await request.json();
  const { error } = await supabase.from('tb_doctors').update({ head_of_deparment_id: body.department_id }).eq('id', body.doctor_id);
  if (error) {
    return new Response(JSON.stringify({ message: 'حدث خطأ اثناء تعيين القسم' }), {
      headers: { 'content-type': 'application/json' },
      status: 400
    });
  }
  return new Response(JSON.stringify({ message: 'تم تعيين القسم بنجاح' }), {
    headers: { 'content-type': 'application/json' },
  });
}