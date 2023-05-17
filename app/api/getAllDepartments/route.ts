import { createClient } from "@supabase/supabase-js";
import { Database } from "@/app/types/supabase";

const supabase = createClient<Database>(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');


export async function GET() {
  const { data, error } = await supabase.from('tb_departments').select('*');
  if (error) {
    return new Response(JSON.stringify({ message: 'حدث خطأ اثناء جلب الاقسام' }), {
      headers: { 'content-type': 'application/json' },
      status: 400
    });
  }
  return new Response(JSON.stringify({ message: data }), {
    headers: { 'content-type': 'application/json' },
  });
}

