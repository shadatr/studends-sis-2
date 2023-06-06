import { createClient } from "@supabase/supabase-js";


const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");

export async function POST(request: Request) {
  const { id, parmId, active } = await request.json();
  const data = await supabase
    .from('tb_student_perms')
    .update({ active: active })
    .eq('permission_id', id)
    .eq('student_id', parmId)
    .order('id', { ascending: true });
  if (!data.error){
    return new Response(JSON.stringify({ message: "تم تغيير حالة صلاحية الموظف بنجاح" }), {
      headers: { "content-type": "application/json" },
    });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: number } }){
  const data = await supabase
    .from('tb_student_perms')
    .select('*')
    .eq('student_id', params.id);
  try {
    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}