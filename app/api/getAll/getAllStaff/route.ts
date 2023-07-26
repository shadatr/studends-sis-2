import { Database } from "@/app/types/supabase";
import { AdminStaffType } from '@/app/types/types';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient<Database>(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");


export async function GET() {

  const result = await supabase.from("tb_admins").select("*");
  const resp: AdminStaffType[] = [];

  if (result.error) {
    return { status: 400, body: { message: "there is an error" } };
  }

  return new Response(JSON.stringify({ message: resp }), { status: 200 });
}
export const revalidate = false;
