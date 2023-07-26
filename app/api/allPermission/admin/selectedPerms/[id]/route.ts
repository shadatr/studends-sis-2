import { createClient } from "@supabase/supabase-js";
import {GetPermissionType} from '@/app/types/types';

const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const data: GetPermissionType[] = await request.json();
  const res = await Promise.all(
    data.map(async (i) => {
      try {
        const ress = await supabase
          .from('tb_admin_perms')
          .update(i)
          .eq('permission_id', i.permission_id)
          .eq('id', i.id);
        console.log(ress.error?.message);
        return ress;
      } catch (error) {
        return { error };
      }
    })
  );
  if (res){
    return new Response(JSON.stringify({ message: "تم تغيير حالة صلاحية الموظف بنجاح" }), {
      headers: { "content-type": "application/json" },
    });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: number } }){
  const data = await supabase
    .from('tb_admin_perms')
    .select('*')
    .eq('admin_id', params.id)
    .order('id', { ascending: false });

    try {
    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
        headers: { revalidate: dynamic },
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}