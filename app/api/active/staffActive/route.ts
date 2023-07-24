import { Database } from "@/app/types/supabase";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient<Database>(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");

export async function POST(request: Request) {
  // console.log("request", await request.json());
  const { adminId, active } = await request.json();
  console.log("adminId", adminId, "active", active);
  const data =await supabase.from("tb_admins").update({ active: active }).eq("id", adminId).order("id", { ascending: true });
  if (!data.error){
    return new Response(JSON.stringify({ message: "تم تغيير حالة الموظف بنجاح" }), {
      headers: { "content-type": "application/json" },
    });
  }
}