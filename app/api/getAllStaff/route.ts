import { Database } from "@/app/types/supabase";
import { AdminStaffType } from "@/app/types/types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient<Database>(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");


export async function GET() {
  const result = await supabase.from("tb_admins").select("*");
  const resp: AdminStaffType[] = [];

  if (result.error) {
    return { status: 400, body: { message: "حدث خطا ما" } };
  }
  for (let i = 0; i < result.data.length; i++) {
    resp.push({
      id: result.data[i].id,
      name: result.data[i].name,
      surname: result.data[i].surname,
      admin: result.data[i].admin,
      createdAt: result.data[i].enrollment_date,
      active : result.data[i].active
    });
  }

  return new Response(JSON.stringify({ message: resp }), { status: 200 });
}