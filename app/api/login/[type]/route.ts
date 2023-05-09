import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");


export async function POST(request: Request) {
  const body: { username: string, password: string } = await request.json();


  const { data, error } = await supabase.from("tb_students_info").select("*").eq("username", body.username).eq("password", body.password);

  if (!data && error || data && data.length === 0) {
    return new Response(JSON.stringify({ "error": "اسم مستخدم او كلمة مرور خاطئة" }), { headers: { "content-type": "application/json" }, status: 401 },);
  } else {
    return new Response(JSON.stringify({ "message": "تم تسجيل الدخول بنجاح" }), { headers: { "content-type": "application/json" } },);
  }
}
