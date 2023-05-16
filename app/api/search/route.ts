import { Database } from "@/app/types/supabase";
import { SearchIntityType } from "@/app/types/types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient<Database>(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");

export async function POST(request: Request) {
  const body: SearchIntityType = await request.json();
  console.log(body.searchType);
  if (!isNaN(Number(body.searchBy))) {
    const { data, error } = await supabase.from(`tb_${body.searchType}`).select().eq("id", body.searchBy);
    console.log(data);
    if (data?.length == 0) {
      return new Response(JSON.stringify({ message: "لا يوجد نتائج" }), { status: 200 });
    }
  } else {
    const { data, error } = await supabase.from(`tb_${body.searchType}`).select().textSearch("name", body.searchBy.split(" ")[0]);
    console.log(error?.message);
    if (data?.length == 0) {
      return new Response(JSON.stringify({ message: "لا يوجد نتائج" }), { status: 200 });
    }
  }
  Number(body.searchBy);
}