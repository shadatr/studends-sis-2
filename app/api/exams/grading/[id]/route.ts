import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function GET(request: Request,{ params }: { params: { id: number } }) {
  try {
    const data = await supabase
      .from('tb_letter_grades')
      .select('*')
      .eq('id', params.id);
    

    return new Response(
      JSON.stringify({ message: data.data })
    );
  } catch {}
}

export async function POST(
  request: Request,
  { params }: { params: { id: number } }
) {
  const data1 = await request.json();
  const data2 = await supabase
    .from('tb_letter_grades')
    .update(data1)
    .eq('id', params.id);

  console.log(data2.error?.message);

  return new Response(JSON.stringify({ message: 'تم حذف الاعلان بنجاح' }));
}
