import { Database } from "@/app/types/supabase";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient<Database>(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");

export async function POST(request: Request) {
  const { doctorId, active } = await request.json();
  const data = await supabase
    .from('tb_doctors')
    .update({ active: active })
    .eq('id', doctorId)
    .order('id', { ascending: true });
  if (!data.error){
    return new Response(JSON.stringify({ message: "تم تغيير حالة الدكتور بنجاح" }), {
      headers: { "content-type": "application/json" },
    });
  }
}