import { createClient } from '@supabase/supabase-js';


const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);


export async function GET() {
  try {
    const data = await supabase
      .from('tb_announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .eq('general', 'TRUE');

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}

export async function POST(request : Request) {
  const req = await request.json();
  console.log(req);
  const deleteReq = await supabase
    .from('tb_announcements')
    .delete()
    .eq('announcement_text', req.item_announcement_text);
  console.log(deleteReq.error);
  return new Response(JSON.stringify({message : "تم حذف الاعلان بنجاح"}));
}
