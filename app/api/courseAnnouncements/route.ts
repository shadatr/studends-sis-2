import { AnnouncmentsMangType } from '@/app/types';
import { createClient } from '@supabase/supabase-js';


const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);


export async function GET() {
  try {
    const data = await supabase.from('tb_announcements').select('*').order("created_at", {ascending : false}).eq('type', 'course');


    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}



export async function POST(request: Request) {
  const data: AnnouncmentsMangType = await request.json();

  try {
    const res = await supabase.from('tb_announcements').insert([data]);
    if (res.error) {
      throw res.error;
    }
    return new Response(JSON.stringify({ message: 'تم  نشر الاعلان بنجاح' }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'هناك مشكلة، لم يتم نشر الاعلان' }),
      {
        headers: { 'content-type': 'application/json' },
        status: 400,
      }
    );
  }
}