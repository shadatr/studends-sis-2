import { createClient } from '@supabase/supabase-js';
import { AnnouncmentsMangType } from '@/app/types';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);


export async function GET() {
  try {
    const data = await supabase.from('tb_announcements').select('*').order("created_at", {ascending : false});

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
  const deleteReq = await supabase.from("tb_announcements").delete().eq("id" , req.item_id);
  console.log(deleteReq.error);
  return new Response(JSON.stringify({message : "announcement was deleted sucessfully"}));
}
