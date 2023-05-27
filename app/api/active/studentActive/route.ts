import { Database } from "@/app/types/supabase";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient<Database>(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");

export async function POST(request: Request) {
  // console.log("request", await request.json());
  const { studentId, active } = await request.json();
  const data =await supabase.from("tb_students").update({ active: active }).eq("id", studentId).order("id", { ascending: true });
  if (!data.error){
    return new Response(JSON.stringify({ message: "تم تغيير حالة الطالب بنجاح" }), {
      headers: { "content-type": "application/json" },
    });
  }
}