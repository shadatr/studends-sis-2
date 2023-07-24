import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(request: Request) {
  const data = await request.json();

  const currentDate = new Date();
  const currentDateValue = currentDate.toISOString().split('T')[0];
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;

  await supabase.from('tb_usage_history').insert([
    {
      user_id: data.id,
      action: data.action,
      type: data.type,
      date: currentDateValue + " / "+ formattedTime,
    },
  ]);
}

export async function GET() {
  try {
    const data = await supabase
      .from('tb_usage_history')
      .select('*').order('id', { ascending: false });

    if (data.error) {
      return new Response(JSON.stringify({ message: 'an error occured' }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ message: data.data }));
  } catch {}
}

