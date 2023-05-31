import { createClient } from '@supabase/supabase-js';
import { AnnouncmentsMangType } from '@/app/types/types';
import { Database } from '@/app/types/supabase';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data: AnnouncmentsMangType = await request.json();

  try {
    const res = await supabase.from('tb_announcements').insert([data]);
    console.log(res.error?.message);
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
